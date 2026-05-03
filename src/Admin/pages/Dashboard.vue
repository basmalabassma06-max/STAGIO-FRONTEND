<template>
  <div class="page">
    <div class="page__header">
      <h1>Dashboard 📊</h1>

      <div style="display:flex;gap:8px">
        <button class="btn btn--outline btn--sm" @click="exportStats">
          ⬇ Export Stats PDF
        </button>

        <button class="btn btn--outline btn--sm" @click="exportInternships">
          ⬇ Export Internships PDF
        </button>

        <button class="btn btn--ghost btn--sm" @click="load">
          ↺ Refresh
        </button>
      </div>
    </div>

    <div v-if="loading" class="page__loading">
      Loading dashboard…
    </div>

    <template v-else>
      <!-- STAT CARDS -->
      <div class="stat-grid">
        <StatCard :value="s.students"         label="Students" />
        <StatCard :value="s.companies"         label="Companies" />
        <StatCard :value="s.total"             label="Total Internships" />
        <StatCard :value="s.pending"           label="Pending Admin"     color="warning" />
        <StatCard :value="s.validated"         label="Validated"         color="success" />
        <StatCard :value="s.rejected"          label="Rejected"          color="danger" />
        <StatCard :value="s.placement_rate + '%'" label="Placement Rate" color="gold" />
        <StatCard :value="s.unplaced_students" label="Unplaced Students" />
      </div>

      <!-- PENDING COMPANIES ALERT -->
      <section v-if="s.pending_companies > 0" class="section section--alert">
        <div class="pending-companies-banner">
          <div>
            <strong>🏢 {{ s.pending_companies }} company waiting for approval</strong>
            <span class="muted">Review their agreement files and approve or reject.</span>
          </div>
          <router-link to="/admin/companies" class="btn btn--warning btn--sm">
            Review Now →
          </router-link>
        </div>
      </section>

      <!-- PENDING INTERNSHIPS QUICK LIST -->
      <section class="section">
        <div class="section__header">
          <h2>Pending Validation</h2>

          <router-link
            to="/admin/internships?status=pending_admin"
            class="btn btn--ghost btn--sm"
          >
            View all →
          </router-link>
        </div>

        <div v-if="pendingList.length === 0" class="empty">
          No pending internships
        </div>

        <InternshipRow
          v-for="item in pendingList"
          :key="item.id"
          :item="item"
          @validate="quickValidate"
          @reject="openReject"
        />
      </section>

      <!-- TOP COMPANIES -->
      <section class="section">
        <h2>Top Companies</h2>

        <div v-if="topCompanies.length === 0" class="empty">
          No data
        </div>

        <div v-else class="top-companies">
          <div
            v-for="(tc, i) in topCompanies"
            :key="tc.company_id"
            class="top-company-row"
          >
            <span class="top-company-rank">#{{ i + 1 }}</span>
            <span class="top-company-name">{{ tc.company?.name || "—" }}</span>
            <span class="badge badge--neutral">{{ tc.total }} internships</span>
          </div>
        </div>
      </section>
    </template>

    <!-- REJECT MODAL -->
    <ConfirmModal
      :show="rejectModal.show"
      title="Reject Internship"
      message="Reject this internship?"
      label="Reject"
      :danger="true"
      :withReason="true"
      @confirm="doReject"
      @cancel="rejectModal.show = false"
    />

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import adminApi        from "../../services/adminApi";
import StatCard        from "../components/StatCard.vue";
import InternshipRow   from "../components/InternshipRow.vue";
import ConfirmModal    from "../components/ConfirmModal.vue";
import Toast           from "../components/Toast.vue";

const s            = ref({});
const pendingList  = ref([]);
const topCompanies = ref([]);
const loading      = ref(true);
const toast        = ref(null);

const rejectModal = ref({ show: false, id: null });

const load = async () => {
  loading.value = true;
  try {
    const [dashRes, internRes] = await Promise.all([
      adminApi.dashboard(),
      adminApi.internships({ status: "pending_admin", per_page: 5 })
    ]);

    const d = dashRes.data.data;
    s.value            = d.stats;
    topCompanies.value = d.top_companies;
    pendingList.value  = internRes.data.data.data;
  } catch {
    toast.value?.notify("Failed to load dashboard", "error");
  } finally {
    loading.value = false;
  }
};

const quickValidate = async (id) => {
  try {
    await adminApi.validateInternship(id);
    toast.value?.notify("Internship validated ✓");
    load();
  } catch (e) {
    toast.value?.notify(e.response?.data?.message || "Error", "error");
  }
};

const openReject = (id) => {
  rejectModal.value = { show: true, id };
};

const doReject = async (reason) => {
  rejectModal.value.show = false;
  try {
    await adminApi.rejectInternship(rejectModal.value.id, reason);
    toast.value?.notify("Internship rejected");
    load();
  } catch (e) {
    toast.value?.notify(e.response?.data?.message || "Error", "error");
  }
};

const exportStats = async () => {
  try {
    const res = await adminApi.exportStats();
    triggerDownload(res.data, `admin-stats-${today()}.pdf`);
  } catch {
    toast.value?.notify("Export failed", "error");
  }
};

const exportInternships = async () => {
  try {
    const res = await adminApi.exportInternships();
    triggerDownload(res.data, `internships-${today()}.pdf`);
  } catch {
    toast.value?.notify("Export failed", "error");
  }
};

const triggerDownload = (blob, name) => {
  const url = URL.createObjectURL(new Blob([blob]));
  const a   = document.createElement("a");
  a.href     = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const today = () => new Date().toISOString().split("T")[0];

onMounted(load);
</script>

<style scoped>
.top-companies {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.top-company-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 16px;
}

.top-company-rank {
  width: 28px;
  font-size: 18px;
  font-weight: 800;
  color: var(--muted);
}

.top-company-name {
  flex: 1;
  font-weight: 600;
}

.section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

/* Pending companies banner */
.section--alert {
  margin-bottom: 0;
}

.pending-companies-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 12px;
  padding: 16px 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.pending-companies-banner > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.muted {
  font-size: 13px;
  color: var(--muted, #94a3b8);
}
</style>