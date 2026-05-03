<template>
  <div class="page">
    <div class="page__header">
      <h1>My Offers</h1>

      <router-link to="/company/offers/create" class="btn btn--primary">
        + New Offer
      </router-link>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input
        v-model="search"
        class="filters__input"
        placeholder="🔍 Search by title..."
        @input="debouncedLoad"
      />

      <select
        v-model="typeFilter"
        class="filters__select"
        @change="load(1)"
      >
        <option value="">All types</option>
        <option value="internship">Internship</option>
        <option value="job">Job</option>
        <option value="freelance">Freelance</option>
      </select>

      <button class="btn btn--ghost" @click="resetFilters">
        Reset
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="page__loading">
      Loading offers...
    </div>

    <!-- Empty -->
    <div v-else-if="offers.length === 0" class="empty">
      No offers found.
    </div>

    <!-- List -->
    <template v-else>
      <div class="offer-list">
        <OfferRow
          v-for="offer in offers"
          :key="offer.id"
          :offer="offer"
          @toggle="handleToggle"
          @delete="confirmDelete"
        />
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="lastPage > 1">
        <button
          v-for="p in lastPage"
          :key="p"
          :class="[
            'btn',
            'btn--sm',
            p === currentPage ? 'btn--primary' : 'btn--ghost'
          ]"
          @click="load(p)"
        >
          {{ p }}
        </button>
      </div>
    </template>

    <!-- Delete Modal -->
    <div
      v-if="showConfirm"
      class="modal-backdrop"
      @click.self="showConfirm = false"
    >
      <div class="modal">
        <h3>Delete Offer</h3>
        <p>
          This offer will be permanently deleted.
          Are you sure?
        </p>

        <div class="modal-actions">
          <button
            class="btn btn--ghost"
            @click="showConfirm = false"
          >
            Cancel
          </button>

          <button
            class="btn btn--danger"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import companyApi from "../../services/companyApi";
import OfferRow from "../components/OfferRow.vue";

const offers = ref([]);
const loading = ref(false);

const currentPage = ref(1);
const lastPage = ref(1);

const search = ref("");
const typeFilter = ref("");

const showConfirm = ref(false);
const pendingDeleteId = ref(null);

/* Search debounce */
let debounceTimer = null;

function debouncedLoad() {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    load(1);
  }, 400);
}

/* Load offers */
async function load(page = 1) {
  loading.value = true;

  try {
    const params = {
      page,
      per_page: 10,
    };

    if (search.value) params.search = search.value;
    if (typeFilter.value) params.type = typeFilter.value;

    const res = await companyApi.myOffers(params);

    offers.value = res.data.data || [];
    currentPage.value = res.data.current_page || 1;
    lastPage.value = res.data.last_page || 1;

    console.log(res.data);

  } catch (error) {
    console.error("Failed to load offers:", error);
  } finally {
    loading.value = false;
  }
}
/* Toggle active */
async function handleToggle(id) {
  try {
    const res = await companyApi.toggleOffer(id);

    const item = offers.value.find(
      (offer) => offer.id === id
    );

    if (item) {
      item.is_active = res.data.is_active;
    }

  } catch (error) {
    console.error("Toggle failed:", error);
  }
}

/* Confirm delete */
function confirmDelete(id) {
  pendingDeleteId.value = id;
  showConfirm.value = true;
}

/* Delete */
async function handleDelete() {
  if (!pendingDeleteId.value) return;

  showConfirm.value = false;

  try {
    await companyApi.deleteOffer(
      pendingDeleteId.value
    );

    offers.value = offers.value.filter(
      (offer) => offer.id !== pendingDeleteId.value
    );

    if (
      offers.value.length === 0 &&
      currentPage.value > 1
    ) {
      load(currentPage.value - 1);
    }

  } catch (error) {
    console.error("Delete failed:", error);
  } finally {
    pendingDeleteId.value = null;
  }
}

/* Reset filters */
function resetFilters() {
  search.value = "";
  typeFilter.value = "";
  load(1);
}

onMounted(() => {
  load();
});
</script>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.page__header h1 {
  margin: 0;
  font-size: 24px;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filters__input,
.filters__select {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg2);
  color: var(--text);
}

.filters__input {
  flex: 1;
  min-width: 220px;
}

.page__loading,
.empty {
  text-align: center;
  padding: 40px 0;
  color: var(--muted);
}

.offer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  width: min(420px, 90vw);
}

.modal h3 {
  margin: 0 0 8px;
}

.modal p {
  color: var(--muted);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>