<template>
  <div class="page">
    <div class="page__header">
      <h1>Notifications 🔔</h1>
      <button class="btn btn--ghost" @click="markAll">Mark all read</button>
    </div>

    <div v-if="loading" class="page__loading">Loading...</div>

    <template v-else>
      <div v-if="notifications.length === 0" class="empty">No notifications</div>

      <div
        v-for="n in notifications"
        :key="n.id"
        :class="['notif-item', !n.is_read && 'notif-item--unread']"
      >
        <p class="notif-item__msg">{{ n.message }}</p>
<div v-if="parsedData(n).certificate_url || parsedData(n).convention_url" class="notif-item__files">
  <a v-if="parsedData(n).certificate_url" :href="parsedData(n).certificate_url" target="_blank" class="btn btn--sm btn--outline">🎓 Download Certificate</a>
  <a v-if="parsedData(n).convention_url"  :href="parsedData(n).convention_url"  target="_blank" class="btn btn--sm btn--outline">📄 Download Convention</a>
</div>
<div class="notif-item__footer">
  <span class="text-muted text-sm">{{ formatDate(n.created_at) }}</span>
  <button
    v-if="!n.is_read"
    class="btn btn--ghost btn--sm"
    @click="markOne(n.id)"
  >Mark read</button>
</div>
      </div>

      <div class="pagination" v-if="lastPage > 1">
        <button
          v-for="p in lastPage"
          :key="p"
          :class="['btn', p === currentPage ? 'btn--primary' : 'btn--ghost']"
          @click="goTo(p)"
        >{{ p }}</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import studentApi from "../../services/studentApi";

const notifications = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const lastPage = ref(1);

const load = async (page = 1) => {
  loading.value = true;
  try {
    const res = await studentApi.notifications(page);
    notifications.value = res.data.data.data;
    currentPage.value = res.data.data.current_page;
    lastPage.value = res.data.data.last_page;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const goTo = (p) => load(p);

const markOne = async (id) => {
  await studentApi.markAsRead(id);
  load(currentPage.value);
};

const markAll = async () => {
  await studentApi.markAllAsRead();
  load(currentPage.value);
};

const formatDate = (d) => new Date(d).toLocaleString();
const parsedData = (n) => {
  try { return typeof n.data === 'string' ? JSON.parse(n.data) : (n.data || {}); }
  catch { return {}; }
};

onMounted(() => load());
</script>