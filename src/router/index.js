import { createRouter, createWebHistory } from "vue-router";

/* =========================
   LAYOUTS
========================= */
import MainLayout from "../layouts/MainLayout.vue";
import CompanyLayout from "../layouts/CompanyLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";

/* =========================
   AUTH
========================= */
import Login from "../auth/pages/Login.vue";
import Register from "../auth/pages/Register.vue";
import AdminLogin from "../Admin/pages/AdminLogin.vue";

/* =========================
   STUDENT
========================= */
import Dashboard from "../students/pages/Dashboard.vue";
import Offers from "../students/pages/Offers.vue";
import OfferDetails from "../students/pages/OfferDetails.vue";
import Applications from "../students/pages/Applications.vue";
import SavedOffers from "../students/pages/SavedOffers.vue";
import Recommended from "../students/pages/Recommended.vue";
import Notifications from "../students/pages/Notifications.vue";
import Stats from "../students/pages/Stats.vue";
import Profile from "../students/pages/Profile.vue";

/* =========================
   COMPANY
========================= */
import CompanyDashboard from "../company/pages/Dashboard.vue";
import CompanyApplications from "../company/pages/Applications.vue";
import AppDetail from "../company/pages/AppDetail.vue";
import CompanyOffers from "../company/pages/Offers.vue";
import OfferForm from "../company/pages/OfferForm.vue";
import CompanyNotifications from "../company/pages/Notifications.vue";
import CompanyProfile from "../company/pages/Profile.vue";

/* =========================
   ADMIN
========================= */
import AdminDashboard from "../Admin/pages/Dashboard.vue";
import Internships from "../Admin/pages/Internships.vue";
import InternshipDetail from "../Admin/pages/InternshipDetail.vue";
import Files from "../Admin/pages/Files.vue";
import Logs from "../Admin/pages/Logs.vue";
import AdminNotifications from "../Admin/pages/Notifications.vue";

/* =========================
   HELPERS
========================= */
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

/* =========================
   ROUTES
========================= */
const routes = [
  { path: "/", redirect: "/login" },

  /* AUTH */
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/admin/login", component: AdminLogin },

  /* STUDENT */
  {
    path: "/student",
    component: MainLayout,
    meta: { auth: true, role: "student" },
    children: [
      { path: "", component: Dashboard },
      { path: "offers", component: Offers },
      { path: "offers/:id", name: "offerDetails", component: OfferDetails },
      { path: "applications", component: Applications },
      { path: "saved", component: SavedOffers },
      { path: "recommended", component: Recommended },
      { path: "notifications", component: Notifications },
      { path: "stats", component: Stats },
      { path: "profile", component: Profile },
    ],
  },

  /* COMPANY */
  {
    path: "/company",
    component: CompanyLayout,
    meta: { auth: true, role: "company" },
    children: [
      { path: "", component: CompanyDashboard },
      { path: "applications", component: CompanyApplications },
      { path: "applications/:id", component: AppDetail },
      { path: "offers", component: CompanyOffers },
      { path: "offers/create", component: OfferForm },
      { path: "offers/:id/edit", component: OfferForm },
      { path: "notifications", component: CompanyNotifications },
      { path: "profile", component: CompanyProfile },
    ],
  },

  /* ADMIN */
  {
    path: "/admin",
    component: AdminLayout,
    meta: { auth: true, role: "admin" },
    children: [
      { path: "", component: AdminDashboard },
      { path: "internships", component: Internships },
      { path: "internships/:id", component: InternshipDetail },
      { path: "files", component: Files },
      { path: "logs", component: Logs },
      { path: "notifications", component: AdminNotifications },
        
{ path: "companies", component: () => import("../Admin/pages/Companies.vue") }
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/login" },
];

/* =========================
   ROUTER
========================= */
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

/* =========================
   GUARD
========================= */
router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const user = getUser();

  const requiresAuth = to.matched.some((r) => r.meta.auth);

  const requiredRole = to.matched
    .map((r) => r.meta.role)
    .find((role) => role);

  /* not logged */
  if (requiresAuth && !token) {
    if (to.path.startsWith("/admin")) return "/login";
    return "/login";
  }

  /* wrong role */
  if (requiredRole && (!user || user.role !== requiredRole)) {
    if (!user) return "/login";

    if (user.role === "admin") return "/admin";
    if (user.role === "company") return "/company";
    return "/student";
  }

  /* already logged */
  if ((to.path === "/login" || to.path === "/register") && token) {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "company") return "/company";
    return "/student";
  }

  if (to.path === "/admin/login" && token) {
    if (user?.role === "admin") return "/admin";
  }

  return true;
  
});

export default router;