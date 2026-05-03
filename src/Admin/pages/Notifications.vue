<template>
  <div class="page">
    <div class="page__header">
      <h1>Notifications 🔔</h1>
      <button
        class="btn btn--ghost btn--sm"
        @click="markAll"
        :disabled="!hasUnread"
      >
        Mark all read
      </button>
    </div>

    <div v-if="loading" class="page__loading">Loading…</div>

    <template v-else>
      <div v-if="notifications.length === 0" class="empty">
        No notifications
      </div>

      <div
        v-for="n in notifications"
        :key="n.id"
        :class="['notif-item', !n.is_read && 'notif-item--unread']"
      >
        <div class="notif-item__body">
          <p class="notif-item__msg">{{ n.message }}</p>
          <span class="text-muted text-sm">
            {{ fmtDate(n.created_at) }}
          </span>
        </div>

        <button
          v-if="!n.is_read"
          class="btn btn--ghost btn--sm"
          @click="markOne(n.id)"
        >
          Mark read
        </button>
      </div>

      <Pagination
        :current="page"
        :lastPage="lastPage"
        @change="load"
      />
    </template>

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import adminApi from "../../services/adminApi";
import Pagination from "../components/Pagination.vue";
import Toast from "../components/Toast.vue";

const notifications = ref([]);
const loading = ref(false);
const page = ref(1);
const lastPage = ref(1);
const toast = ref(null);

const hasUnread = computed(() =>
  notifications.value.some(n => !n.is_read)
);

const load = async (p = 1) => {
  loading.value = true;

  try {
    const res = await adminApi.notifications(p);

    const paged = res.data.data;

    notifications.value = paged.data || [];
    page.value = paged.current_page || 1;
    lastPage.value = paged.last_page || 1;

  } catch (e) {
    toast.value?.notify("Failed to load", "error");
  }

  loading.value = false;
};

const markOne = async (id) => {
  try {
    await adminApi.markNotification(id);
    await load(page.value);
    toast.value?.notify("Marked as read");
  } catch {
    toast.value?.notify("Failed", "error");
  }
};

const markAll = async () => {
  try {
    await adminApi.markAllNotifications();
    await load(page.value);
    toast.value?.notify("All marked as read");
  } catch {
    toast.value?.notify("Failed", "error");
  }
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString() : "";

onMounted(() => {
  load(1);
});
</script>