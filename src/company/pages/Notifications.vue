<template>
  <div class="page">
    <div class="page__header">
      <h1>Notifications 🔔</h1>
      <button class="btn btn--ghost" @click="markAll" :disabled="!hasUnread">Mark all read</button>
    </div>

    <div v-if="loading" class="page__loading">Loading…</div>

    <template v-else>
      <div v-if="notifications.length === 0" class="empty">No notifications</div>

      <div
        v-for="n in notifications"
        :key="n.id"
        :class="['notif-item', !n.is_read && 'notif-item--unread']"
      ><p class="notif-item__msg">{{ n.message }}</p>
<div v-if="parsedData(n).certificate_url || parsedData(n).convention_url" class="notif-item__files">
  <a v-if="parsedData(n).certificate_url" :href="parsedData(n).certificate_url" target="_blank" class="btn btn--sm btn--outline">🎓 Download Certificate</a>
  <a v-if="parsedData(n).convention_url"  :href="parsedData(n).convention_url"  target="_blank" class="btn btn--sm btn--outline">📄 Download Convention</a>
</div>
<div class="notif-item__footer">
  <span class="text-muted text-sm">{{ fmtDate(n.created_at) }}</span>
  <button v-if="!n.is_read" class="btn btn--ghost btn--sm" @click="markOne(n.id)">
    Mark read
  </button>
</div>
      </div>

      <Pagination :current="page" :lastPage="lastPage" @change="load" />
    </template>

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import companyApi from "../../services/companyApi";
import Pagination from "../components/Pagination.vue";
import Toast      from "../components/Toast.vue";

const notifications = ref([]);
const loading       = ref(false);
const page          = ref(1);
const lastPage      = ref(1);
const toast         = ref(null);

const hasUnread = computed(() => notifications.value.some((n) => !n.is_read));

const load = async (p = 1) => {
  loading.value = true;
  try {
    const res  = await companyApi.notifications(p);
    const data = res.data.data;
    notifications.value = data.data;
    page.value          = data.current_page;
    lastPage.value      = data.last_page;
  } catch {
    toast.value?.notify("Failed to load notifications", "error");
  } finally {
    loading.value = false;
  }
};

const markOne = async (id) => {
  try {
    await companyApi.markAsRead(id);
    load(page.value);
  } catch {}
};

const markAll = async () => {
  try {
    await Promise.all(
      notifications.value
        .filter((n) => !n.is_read)
        .map((n) => companyApi.markAsRead(n.id))
    );
    toast.value?.notify("All marked as read ✓");
    load(page.value);
  } catch {
    toast.value?.notify("Error", "error");
  }
};

const fmtDate = (d) => d ? new Date(d).toLocaleString() : "";
const parsedData = (n) => {
  try { return typeof n.data === 'string' ? JSON.parse(n.data) : (n.data || {}); }
  catch { return {}; }
};
onMounted(() => load(1));
</script>