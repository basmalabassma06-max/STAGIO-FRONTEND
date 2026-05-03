<template>
  <div class="page">
    <div class="page__header">
      <h1>Internships 📋</h1>

      <button
        class="btn btn--ghost btn--sm"
        @click="load"
      >
        ↺ Refresh
      </button>
    </div>

    <!-- FILTERS -->
    <div class="filter-panel">
      <input
        v-model="f.student"
        placeholder="Student name…"
        @input="debouncedLoad"
      />

      <input
        v-model="f.company"
        placeholder="Company name…"
        @input="debouncedLoad"
      />

      <input
        v-model="f.offer"
        placeholder="Offer title…"
        @input="debouncedLoad"
      />

      <select
        v-model="f.status"
        @change="load(1)"
      >
        <option value="">All statuses</option>
        <option value="pending_admin">Pending Admin</option>
        <option value="validated">Validated</option>
        <option value="rejected_by_admin">Rejected</option>
        <option value="accepted_by_company">Accepted by Company</option>
      </select>

      <select
        v-model="f.type"
        @change="load(1)"
      >
        <option value="">All types</option>
        <option value="internship">Internship</option>
        <option value="job">Job</option>
        <option value="freelance">Freelance</option>
      </select>

      <input
        v-model="f.wilaya"
        placeholder="Wilaya…"
        @input="debouncedLoad"
      />

      <!-- DATE FROM ONLY -->
      <div class="filter-dates">
        <input
          type="date"
          v-model="f.date_from"
          @change="load(1)"
        />
      </div>

      <div class="filter-actions">
        <button
          class="btn btn--ghost btn--sm"
          @click="clearFilters"
        >
          Clear
        </button>

        <button
          class="btn btn--outline btn--sm"
          @click="exportInternships"
        >
          ⬇ Export PDF
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="page__loading"
    >
      Loading…
    </div>

    <template v-else>
      <p
        v-if="total"
        class="results-count text-muted text-sm"
      >
        {{ total }} result(s)
      </p>

      <div
        v-if="items.length === 0"
        class="empty"
      >
        No internships found
      </div>

      <InternshipRow
        v-for="item in items"
        :key="item.id"
        :item="item"
        @validate="openValidate"
        @reject="openReject"
      />

      <Pagination
        :current="page"
        :lastPage="lastPage"
        @change="load"
      />
    </template>

    <!-- VALIDATE -->
    <ConfirmModal
      :show="valModal.show"
      title="Validate Internship"
      message="Validate this internship?"
      label="Validate"
      @confirm="doValidate"
      @cancel="valModal.show = false"
    />

    <!-- REJECT -->
    <ConfirmModal
      :show="rejModal.show"
      title="Reject Internship"
      message="Reject this internship?"
      label="Reject"
      :danger="true"
      :withReason="true"
      @confirm="doReject"
      @cancel="rejModal.show = false"
    />

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";

import adminApi from "../../services/adminApi";
import InternshipRow from "../components/InternshipRow.vue";
import Pagination from "../components/Pagination.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import Toast from "../components/Toast.vue";

const items = ref([]);
const loading = ref(false);

const page = ref(1);
const lastPage = ref(1);
const total = ref(0);

const toast = ref(null);

const f = reactive({
  student: "",
  company: "",
  offer: "",
  status: "",
  type: "",
  wilaya: "",
  date_from: ""
});

const valModal = ref({
  show: false,
  id: null
});

const rejModal = ref({
  show: false,
  id: null
});

let timer = null;

const debouncedLoad = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    load(1);
  }, 350);
};

const load = async (p = page.value) => {
  loading.value = true;

  try {
    const params = {
      page: p,
      per_page: 15
    };

    if (f.student) params.student = f.student;
    if (f.company) params.company = f.company;
    if (f.offer) params.offer = f.offer;
    if (f.status) params.status = f.status;
    if (f.type) params.type = f.type;
    if (f.wilaya) params.wilaya = f.wilaya;
    if (f.date_from) params.date_from = f.date_from;

    const res = await adminApi.internships(params);
    const d = res.data.data;

    items.value = d.data;
    page.value = d.current_page;
    lastPage.value = d.last_page;
    total.value = d.total;
  } catch {
    toast.value?.notify(
      "Failed to load",
      "error"
    );
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  Object.keys(f).forEach((k) => {
    f[k] = "";
  });

  load(1);
};

const openValidate = (id) => {
  valModal.value = {
    show: true,
    id
  };
};

const openReject = (id) => {
  rejModal.value = {
    show: true,
    id
  };
};

const doValidate = async () => {
  valModal.value.show = false;

  try {
    await adminApi.validateInternship(
      valModal.value.id
    );

    toast.value?.notify(
      "Validated ✓"
    );

    load();
  } catch (e) {
    toast.value?.notify(
      e.response?.data?.message ||
        "Validation failed",
      "error"
    );
  }
};

const doReject = async (reason) => {
  rejModal.value.show = false;

  try {
    await adminApi.rejectInternship(
      rejModal.value.id,
      reason
    );

    toast.value?.notify(
      "Internship rejected"
    );

    load();
  } catch (e) {
    toast.value?.notify(
      e.response?.data?.message ||
        "Error",
      "error"
    );
  }
};

const exportInternships = async () => {
  try {
    const res =
      await adminApi.exportInternships();

    const url =
      URL.createObjectURL(
        new Blob([res.data])
      );

    const a =
      document.createElement("a");

    a.href = url;
    a.download =
      "internships.pdf";

    a.click();

    URL.revokeObjectURL(url);
  } catch {
    toast.value?.notify(
      "Export failed",
      "error"
    );
  }
};

onMounted(() => load(1));
</script>

<style scoped>
.filter-panel{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  background:var(--bg2);
  border:1px solid var(--border);
  border-radius:12px;
  padding:16px;
}

.filter-panel input,
.filter-panel select{
  flex:1;
  min-width:170px;
}

.filter-dates{
  min-width:180px;
}

.filter-actions{
  display:flex;
  gap:8px;
}

.results-count{
  margin-bottom:8px;
}
</style>