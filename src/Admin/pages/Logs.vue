<template>
  <div class="page">
    <div class="page__header">
      <h1>Activity Logs 📝</h1>
      <button class="btn btn--ghost btn--sm" @click="load">↺ Refresh</button>
    </div>

    <div v-if="loading" class="page__loading">Loading logs…</div>

    <template v-else>
      <div v-if="logs.length === 0" class="empty">No logs found</div>

      <div class="logs-list">
        <div v-for="log in logs" :key="log.id" class="log-row">
          <div class="log-row__left">
            <span class="log-row__action">{{ formatAction(log.action) }}</span>
            <span class="text-muted text-sm">by {{ log.admin?.name || "Admin" }}</span>
          </div>
          <div class="log-row__right">
            <span v-if="log.target_id" class="badge badge--neutral">ID {{ log.target_id }}</span>
            <span v-if="log.details"   class="log-row__details text-muted text-sm">{{ log.details }}</span>
            <span class="log-row__ip text-muted text-sm">{{ log.ip }}</span>
            <span class="log-row__time text-muted text-sm">{{ fmtDate(log.created_at) }}</span>
          </div>
        </div>
      </div>

      <Pagination :current="page" :lastPage="lastPage" @change="load" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import adminApi   from "../../services/adminApi";
import Pagination from "../components/Pagination.vue";

const logs     = ref([]);
const loading  = ref(false);
const page     = ref(1);
const lastPage = ref(1);

const load = async (p = page.value) => {
  loading.value = true;
  try {
    const res = await adminApi.getLogs({ page: p, per_page: 20 });
    const d   = res.data.data;
    logs.value     = d.data;
    page.value     = d.current_page;
    lastPage.value = d.last_page;
  } finally { loading.value = false; }
};

const actionMap = {
  login:               "🔐 Login",
  logout:              "🚪 Logout",
  validate_internship: "✅ Validated Internship",
  view_internships:    "👁 Viewed Internships",
  toggle_user:         "🔄 Toggled User",
  delete_user:         "🗑 Deleted User",
  download_file:       "⬇ Downloaded File",
  delete_file:         "🗑 Deleted File",
  export_stats:        "📊 Exported Stats",
  export_internships:  "📋 Exported Internships",
};

const formatAction = (a) => actionMap[a] || a?.replace(/_/g, " ");
const fmtDate = (d) => d ? new Date(d).toLocaleString() : "";

onMounted(() => load(1));
</script>

<style scoped>
.logs-list { display:flex; flex-direction:column; gap:8px; }
.log-row { background:var(--bg2); border:1px solid var(--border); border-radius:10px; padding:12px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
.log-row__left { display:flex; flex-direction:column; gap:2px; }
.log-row__action { font-size:14px; font-weight:600; }
.log-row__right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.log-row__details { max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
</style>