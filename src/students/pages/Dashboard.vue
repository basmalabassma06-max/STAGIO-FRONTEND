<template>
  <div class="page">
    <div v-if="loading" class="page__loading">Loading dashboard...</div>

    <template v-else>
      <!-- STAT CARDS -->
      <div class="stat-grid">
        <div class="stat-card">
          <span class="stat-card__num">{{ stats.total || 0 }}</span>
          <span class="stat-card__label">Total Applications</span>
        </div>
        <div class="stat-card stat-card--success">
          <span class="stat-card__num">{{ stats.accepted_by_company || 0 }}</span>
          <span class="stat-card__label">Accepted</span>
        </div>
        <div class="stat-card stat-card--danger">
          <span class="stat-card__num">{{ stats.rejected_by_company || 0 }}</span>
          <span class="stat-card__label">Rejected</span>
        </div>
        <div class="stat-card stat-card--gold">
          <span class="stat-card__num">{{ stats.validated || 0 }}</span>
          <span class="stat-card__label">Validated</span>
        </div>
      </div>

      <!-- RECENT APPLICATIONS -->
      <section class="section">
        <h2 class="section__title">Recent Applications</h2>

        <div v-if="apps.length === 0" class="empty">No recent activity yet</div>

        <div v-else class="recent-list">
          <div v-for="app in apps" :key="app.id" class="recent-item">
            <div>
              <h4>{{ app.offer?.title }}</h4>
              <span class="text-muted">{{ app.offer?.company?.name }}</span>
            </div>
            <span :class="['badge', statusClass(app.status)]">
              {{ formatStatus(app.status) }}
            </span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import studentApi from "../../services/studentApi";

const stats = ref({});
const apps = ref([]);
const loading = ref(true);

const load = async () => {
  loading.value = true;
  try {
    const res = await studentApi.dashboard();
    stats.value = res.data.data.stats;
    apps.value = res.data.data.applications.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const statusClass = (s) => {
  if (s?.includes("accepted")) return "badge--success";
  if (s?.includes("rejected")) return "badge--danger";
  if (s === "validated") return "badge--gold";
  return "badge--warning";
};

const formatStatus = (s) =>
  s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

onMounted(load);
</script>