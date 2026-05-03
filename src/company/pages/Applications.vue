<template>
  <div class="page">
    <div class="page__header">
      <h1>Applications 📋</h1>
      <button class="btn btn--ghost" @click="load">↺ Refresh</button>
    </div>

    <!-- FILTERS -->
    <div class="filters">
      <input v-model="filters.search" placeholder="Search by name or email…" @input="debouncedLoad" />

      <select v-model="filters.status" @change="load">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="accepted_by_company">Accepted</option>
        <option value="rejected_by_company">Rejected</option>
        <option value="validated">Validated</option>
      </select>

      <input type="date" v-model="filters.date" @change="load" />

      <button class="btn btn--ghost btn--sm" @click="clearFilters">Clear</button>
    </div>

    <div v-if="loading" class="page__loading">Loading…</div>

    <template v-else>
      <div v-if="apps.length === 0" class="empty">No applications found</div>

      <AppCard
        v-for="a in apps"
        :key="a.id"
        :app="a"
        @accept="accept"
        @reject="reject"
      />

      <Pagination :current="page" :lastPage="lastPage" @change="goTo" />
    </template>

    <ConfirmModal
      :show="modal.show"
      :title="modal.title"
      :message="modal.message"
      :label="modal.label"
      :danger="modal.danger"
      @confirm="modal.onConfirm"
      @cancel="modal.show = false"
    />

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import companyApi  from "../../services/companyApi";
import AppCard     from "../components/AppCard.vue";
import Pagination  from "../components/Pagination.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import Toast       from "../components/Toast.vue";

const apps     = ref([]);
const loading  = ref(false);
const page     = ref(1);
const lastPage = ref(1);
const toast    = ref(null);

const filters = reactive({ search: "", status: "", date: "" });

const modal = reactive({
  show: false, title: "", message: "", label: "Confirm",
  danger: false, onConfirm: () => {},
});

let debounceTimer = null;
const debouncedLoad = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => load(1), 350);
};

const load = async (p = page.value) => {
  loading.value = true;
  try {
    const params = { page: p, per_page: 10 };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.date)   params.date   = filters.date;

    const res = await companyApi.applications(params);
    apps.value     = res.data.data.data;
    page.value     = res.data.data.current_page;
    lastPage.value = res.data.data.last_page;
  } catch {
    toast.value?.notify("Failed to load applications", "error");
  } finally {
    loading.value = false;
  }
};

const goTo = (p) => load(p);

const clearFilters = () => {
  filters.search = ""; filters.status = ""; filters.date = "";
  load(1);
};

const accept = (id) => {
  modal.title     = "Accept Application";
  modal.message   = "Accept this application and create an internship pending admin validation?";
  modal.label     = "Accept";
  modal.danger    = false;
  modal.show      = true;
  modal.onConfirm = async () => {
    modal.show = false;
    try {
      await companyApi.acceptApplication(id);
      toast.value?.notify("Application accepted ✓");
      load();
    } catch (e) {
      toast.value?.notify(e.response?.data?.message || "Error", "error");
    }
  };
};

const reject = (id) => {
  modal.title     = "Reject Application";
  modal.message   = "Reject this application? The student will be notified.";
  modal.label     = "Reject";
  modal.danger    = true;
  modal.show      = true;
  modal.onConfirm = async () => {
    modal.show = false;
    try {
      await companyApi.rejectApplication(id);
      toast.value?.notify("Application rejected");
      load();
    } catch (e) {
      toast.value?.notify(e.response?.data?.message || "Error", "error");
    }
  };
};

onMounted(() => load(1));
</script>