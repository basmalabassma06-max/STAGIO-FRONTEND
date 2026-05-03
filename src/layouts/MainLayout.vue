<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar__logo">
        <span class="sidebar__logo-icon">🎓</span>
        <span class="sidebar__logo-text">InternApp</span>
      </div>

      <nav class="sidebar__nav">
        <router-link to="/student" exact-active-class="active">
          <span>📊</span>
          Dashboard
        </router-link>

        <router-link to="/student/offers" active-class="active">
          <span>💼</span>
          Offers
        </router-link>

        <router-link to="/student/recommended" active-class="active">
          <span>🎯</span>
          Recommended
        </router-link>

        <router-link to="/student/applications" active-class="active">
          <span>📋</span>
          Applications
        </router-link>

        <router-link to="/student/saved" active-class="active">
          <span>❤️</span>
          Saved
        </router-link>

        <router-link to="/student/notifications" active-class="active">
          <span>🔔</span>
          Notifications
          <span v-if="unread > 0" class="sidebar__badge">
            {{ unread }}
          </span>
        </router-link>

        <router-link to="/student/stats" active-class="active">
          <span>📈</span>
          Stats
        </router-link>

        <router-link to="/student/profile" active-class="active">
          <span>👤</span>
          Profile
        </router-link>
      </nav>

      <button class="sidebar__logout" @click="logout">
        <span>🚪</span>
        Logout
      </button>
    </aside>

    <!-- Main -->
    <div class="main">
      <header class="topbar">
        <h2 class="topbar__title">{{ pageTitle }}</h2>

        <div class="topbar__right">
          <button
            class="notif-btn"
            @click="router.push('/student/notifications')"
          >
            🔔
            <span v-if="unread > 0" class="topbar__badge">
              {{ unread }}
            </span>
          </button>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import studentApi from "../services/studentApi";
import api from "../services/api";

const router = useRouter();
const route = useRoute();

const unread = ref(0);
let interval = null;

// Titles
const pageTitles = {
  "/student": "Dashboard",
  "/student/offers": "All Offers",
  "/student/recommended": "Recommended Offers",
  "/student/applications": "My Applications",
  "/student/saved": "Saved Offers",
  "/student/notifications": "Notifications",
  "/student/stats": "Statistics",
  "/student/profile": "My Profile",
};

const pageTitle = computed(() => {
  return pageTitles[route.path] || "InternApp";
});

// Notifications Count
const loadUnread = async () => {
  try {
    const res = await studentApi.unreadCount();
    unread.value = res.data.data.count || 0;
  } catch (error) {
    unread.value = 0;
  }
};

// Logout
const logout = async () => {
  try {
    await api.post("/logout");
  } catch (error) {}

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  router.push("/login");
};

// Mounted
onMounted(() => {
  loadUnread();

  interval = setInterval(() => {
    if (route.path !== "/student/notifications") {
      loadUnread();
    }
}, 30000);});

// Destroy
onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

