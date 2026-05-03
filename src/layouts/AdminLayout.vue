<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar__logo">🛡 Admin</div>

     
<nav class="sidebar__nav">
  <router-link to="/admin" exact-active-class="active">
    <span>📊</span> Dashboard
  </router-link>

  <router-link to="/admin/internships" active-class="active">
    <span>📋</span> Internships
  </router-link>

  <router-link to="/admin/companies" active-class="active">
    <span>🏢</span> Companies
  </router-link>

  <router-link to="/admin/files" active-class="active">
    <span>📁</span> Documents
  </router-link>

  <router-link to="/admin/logs" active-class="active">
    <span>📝</span> Logs
  </router-link>

  <router-link to="/admin/notifications" active-class="active">
    <span>🔔</span> Notifications
    <span v-if="unread > 0" class="sidebar__badge">{{ unread }}</span>
  </router-link>
</nav>



      <button class="sidebar__logout" @click="logout">🚪 Logout</button>
    </aside>

    <div class="main">
      <header class="topbar">
        <h2 class="topbar__title">{{ pageTitle }}</h2>
        <span class="topbar__role-badge">Administrator</span>
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
import adminApi from "../services/adminApi";

const router = useRouter();
const route = useRoute();
const unread = ref(0);

let timer = null;

const titles = {
  "/admin": "Dashboard",
  "/admin/internships": "Internships",
  "/admin/files": "Documents",
  "/admin/logs": "Activity Logs",
  "/admin/notifications": "Notifications",
};

const pageTitle = computed(() => titles[route.path] || "Admin Panel");

const loadUnread = async () => {
  try {
    const res = await adminApi.notifications(1);
    const list = res.data.data?.data || [];
    unread.value = list.filter(n => !n.is_read).length;
  } catch {}
};

const logout = async () => {
  try { await adminApi.logout(); } catch {}

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  router.push("/login"); // 👈 هنا التغيير
};

onMounted(() => {
  loadUnread();
  timer = setInterval(loadUnread, 60000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>