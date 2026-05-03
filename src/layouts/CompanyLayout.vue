<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar__logo">🏢 Company</div>

      <nav class="sidebar__nav">
        <router-link to="/company" exact-active-class="active"><span>📊</span> Dashboard</router-link>
        <router-link to="/company/applications" active-class="active"><span>📋</span> Applications</router-link>
        <router-link to="/company/offers" active-class="active"><span>💼</span> Offers</router-link>
        <router-link to="/company/notifications" active-class="active">
          <span>🔔</span> Notifications
          <span v-if="unread > 0" class="sidebar__badge">{{ unread }}</span>
        </router-link>
        <router-link to="/company/profile" active-class="active"><span>🏢</span> Profile</router-link>
      </nav>

      <button class="sidebar__logout" @click="logout">🚪 Logout</button>
    </aside>

    <div class="main">
      <header class="topbar">
        <h2 class="topbar__title">{{ pageTitle }}</h2>
      </header>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import companyApi from "../services/companyApi";
import api from "../services/api";

const router = useRouter();
const route = useRoute();
const unread = ref(0);

let interval = null;

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const titles = {
  "/company": "Dashboard",
  "/company/applications": "Applications",
  "/company/offers": "My Offers",
  "/company/notifications": "Notifications",
  "/company/profile": "Company Profile",
};

const pageTitle = computed(
  () => titles[route.path] || "Company Portal"
);

const loadUnread = async () => {
  const user = getUser();
  if (user?.role !== "company") return;

  try {
    const res = await companyApi.notifications(1);
    const list = res.data.data?.data || [];
    unread.value = list.filter((n) => !n.is_read).length;
  } catch {}
};

const logout = async () => {
  try { await api.post("/logout"); } catch {}
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
};

onMounted(() => {
  const user = getUser();

  if (user?.role !== "company") return;

  loadUnread();
  interval = setInterval(loadUnread, 60000);
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>