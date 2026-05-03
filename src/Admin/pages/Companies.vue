<template>
  <div class="page">
    <div class="page__header">
      <h1>Pending Companies 🏢</h1>
      <button class="btn btn--ghost btn--sm" @click="load">↺ Refresh</button>
    </div>

    <div v-if="loading" class="page__loading">Loading...</div>

    <div v-else-if="companies.length === 0" class="empty">
      No pending companies
    </div>

    <div v-else class="company-list">
      <div v-for="u in companies" :key="u.id" class="company-card">
        <div class="company-card__info">
          <strong>{{ u.company?.name || u.name }}</strong>
          <span class="muted">{{ u.email }}</span>
          <span class="muted">Registered: {{ formatDate(u.created_at) }}</span>
        </div>

        <div class="company-card__actions">
          <button
            v-if="u.company?.agreement_file"
            class="btn btn--outline btn--sm"
            @click="viewAgreement(u.id)"
          >
            📄 View Agreement
          </button>
          <span v-else class="badge badge--warning">No agreement</span>

          <button class="btn btn--success btn--sm" @click="approve(u.id)">
            ✅ Approve
          </button>

          <button class="btn btn--danger btn--sm" @click="openReject(u.id)">
            ❌ Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="rejectModal.show" class="modal-overlay" @click.self="rejectModal.show = false">
      <div class="modal">
        <h3>Reject Company</h3>
        <p class="muted">Provide a reason so the company knows why they were rejected.</p>
        <textarea
          v-model="rejectModal.reason"
          placeholder="Reason for rejection (optional)"
          rows="3"
          class="modal-textarea"
        />
        <div class="modal__actions">
          <button class="btn btn--ghost" @click="rejectModal.show = false">Cancel</button>
          <button class="btn btn--danger" @click="doReject">Confirm Reject</button>
        </div>
      </div>
    </div>

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import adminApi from "../../services/adminApi";
import Toast from "../components/Toast.vue";

const companies = ref([]);
const loading   = ref(true);
const toast     = ref(null);

const rejectModal = ref({
  show:   false,
  id:     null,
  reason: ""
});

const load = async () => {
  loading.value = true;
  try {
    const res = await adminApi.pendingCompanies();
    // handle both paginated and plain array responses
    const d = res.data.data;
    companies.value = d?.data ?? d ?? [];
  } catch {
    toast.value?.notify("Failed to load pending companies", "error");
  } finally {
    loading.value = false;
  }
};

const approve = async (id) => {
  try {
    await adminApi.approveCompany(id);
    toast.value?.notify("Company approved ✅");
    load();
  } catch (e) {
    toast.value?.notify(e.response?.data?.message || "Approval failed", "error");
  }
};

const openReject = (id) => {
  rejectModal.value = { show: true, id, reason: "" };
};

const doReject = async () => {
  try {
    await adminApi.rejectCompany(rejectModal.value.id, rejectModal.value.reason);
    toast.value?.notify("Company rejected ❌");
    rejectModal.value.show = false;
    load();
  } catch (e) {
    toast.value?.notify(e.response?.data?.message || "Rejection failed", "error");
  }
};

const viewAgreement = async (id) => {
  try {
    const res = await adminApi.downloadAgreement(id);
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    window.open(url, "_blank");
  } catch {
    toast.value?.notify("Could not load agreement file", "error");
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString();

onMounted(load);
</script>

<style scoped>
.company-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.company-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.company-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.company-card__info strong {
  font-size: 15px;
}

.company-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: var(--bg2, #1e293b);
  border: 1px solid var(--border, #334155);
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: var(--text, white);
}

.modal h3 {
  font-size: 18px;
  font-weight: 700;
}

.modal-textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border, #334155);
  background: var(--bg, #0f172a);
  color: var(--text, white);
  font-size: 14px;
  resize: vertical;
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.muted {
  font-size: 13px;
  color: var(--muted, #94a3b8);
}

.empty {
  text-align: center;
  color: var(--muted, #94a3b8);
  padding: 40px;
}
</style>