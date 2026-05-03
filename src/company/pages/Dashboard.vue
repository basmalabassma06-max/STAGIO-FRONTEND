<template>
  <div class="page">
    <div class="page__header">
      <h1>Dashboard 📊</h1>
      <button class="btn btn--ghost" @click="load">↺ Refresh</button>
    </div>

    <div v-if="loading" class="page__loading">Loading…</div>

    <template v-else>
      <!-- STATS -->
      <div class="stat-grid">
        <div class="stat-card">
          <span class="stat-card__num">{{ stats.total ?? 0 }}</span>
          <span class="stat-card__label">Total Applications</span>
        </div>
        <div class="stat-card stat-card--success">
          <span class="stat-card__num">{{ stats.accepted ?? 0 }}</span>
          <span class="stat-card__label">Accepted</span>
        </div>
        <div class="stat-card stat-card--gold">
          <span class="stat-card__num">{{ stats.validated ?? 0 }}</span>
          <span class="stat-card__label">Validated</span>
        </div>
      </div>

      <!-- RECENT PENDING -->
      <section class="section">
        <div class="section__header">
          <h2>Pending Applications</h2>
          <router-link to="/company/applications" class="btn btn--ghost btn--sm">View all →</router-link>
        </div>

        <div v-if="pending.length === 0" class="empty">No pending applications</div>

        <AppCard
          v-for="a in pending"
          :key="a.id"
          :app="a"
          @accept="accept"
          @reject="reject"
        />
      </section>
    </template>

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted }    from "vue";
import companyApi            from "../../services/companyApi";
import AppCard               from "../components/AppCard.vue";
import Toast                 from "../components/Toast.vue";

const stats   = ref({});
const pending = ref([]);
const loading = ref(true);
const toast   = ref(null);

const load = async () => {
  loading.value = true;
  try {
    const [sRes, aRes] = await Promise.all([
      companyApi.stats(),
      companyApi.applications({ status: "pending", per_page: 5 }),
    ]);
    stats.value   = sRes.data.data;
    pending.value = aRes.data.data.data;
  } catch (e) {
    toast.value?.notify("Failed to load dashboard", "error");
  } finally {
    loading.value = false;
  }
};

const accept = async (id) => {
  try {
    await companyApi.acceptApplication(id);
    toast.value?.notify("Application accepted ✓");
    load();
  } catch (e) {
    toast.value?.notify(e.response?.data?.message || "Error", "error");
  }
};

const reject = async (id) => {
  try {
    await companyApi.rejectApplication(id);
    toast.value?.notify("Application rejected");
    load();
  } catch (e) {
    toast.value?.notify(e.response?.data?.message || "Error", "error");
  }
};

onMounted(load);
</script>