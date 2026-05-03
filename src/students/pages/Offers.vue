<template>
  <div class="offers-page">

    <!-- HEADER -->
    <div class="offers-header">
      <div>
        <h1>Internship Offers</h1>
        <p>Search, filter and apply easily</p>
      </div>

      <button
        class="refresh-btn"
        @click="loadOffers"
        :disabled="loading"
      >
        {{ loading ? "Loading..." : "Refresh" }}
      </button>
    </div>

    <!-- FILTERS -->
    <div class="filters">

      <!-- SEARCH -->
      <input
        v-model="search"
        @input="debouncedSearch"
        type="text"
        placeholder="Search title, company, skill..."
        class="input"
      />

      <!-- TYPE -->
      <select
        v-model="typeFilter"
        @change="reloadFirstPage"
        class="input"
      >
        <option value="">All Types</option>
        <option value="internship">Internship</option>
        <option value="job">job</option>
        <option value="stage">stage</option>
      </select>

      <!-- WILAYA -->
      <select
        v-model="wilayaFilter"
        @change="reloadFirstPage"
        class="input"
      >
        <option value="">All Wilaya</option>

        <option
          v-for="w in wilayas"
          :key="w"
          :value="w"
        >
          {{ w }}
        </option>
      </select>

      <!-- CLEAR -->
      <button
        class="clear-btn"
        @click="clearFilters"
      >
        Clear
      </button>

    </div>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="loading"
    >
      Loading offers...
    </div>

    <!-- EMPTY -->
    <div
      v-else-if="offers.length === 0"
      class="empty"
    >
      No offers found.
    </div>

    <!-- LIST -->
    <div v-else>

      <p class="count">
        {{ pagination.total }} offers found
      </p>

      <div class="grid">

        <div
          class="card"
          v-for="offer in offers"
          :key="offer.id"
        >
          <h3>{{ offer.title }}</h3>

          <p class="company">
            {{ offer.company?.name || "Unknown Company" }}
          </p>

          <p class="meta">
            📍 {{ offer.wilaya || offer.company?.location || "N/A" }}
          </p>

          <p class="meta">
            💼 {{ offer.type }}
          </p>

          <p class="desc">
            {{ shortText(offer.description) }}
          </p>

          <div class="actions">

            <!-- APPLY -->
            <button
              class="apply"
              @click="applyOffer(offer.id)"
              :disabled="offer.applied"
            >
              {{ offer.applied ? "Applied" : "Apply" }}
            </button>

            <!-- SAVE -->
            <button
              v-if="!offer.saved"
              class="save"
              @click="saveOffer(offer.id)"
            >
              Save
            </button>

            <!-- UNSAVE -->
            <button
              v-else
              class="unsave"
              @click="unsaveOffer(offer.id)"
            >
              Unsave
            </button>

          </div>
        </div>

      </div>

      <!-- PAGINATION -->
      <div class="pagination">

        <button
          @click="changePage(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
        >
          Prev
        </button>

        <span>
          Page {{ pagination.current_page }}
          / {{ pagination.last_page }}
        </span>

        <button
          @click="changePage(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
        >
          Next
        </button>

      </div>

    </div>

    <!-- TOAST -->
    <transition name="fade">
      <div
        v-if="toast.show"
        class="toast"
      >
        {{ toast.message }}
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import studentApi from "../../services/studentApi";

/* =========================
   STATE
========================= */
const offers = ref([]);
const loading = ref(false);

const search = ref("");
const typeFilter = ref("");
const wilayaFilter = ref("");

const page = ref(1);

const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
});

const toast = ref({
  show: false,
  message: "",
});

/* =========================
   WILAYAS
========================= */
const wilayas = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna",
  "Bejaia","Biskra","Bechar","Blida","Bouira",
  "Tamanrasset","Tebessa","Tlemcen","Tiaret","Tizi Ouzou",
  "Alger","Djelfa","Jijel","Setif","Saida",
  "Skikda","Sidi Bel Abbes","Annaba","Guelma","Constantine",
  "Medea","Mostaganem","Msila","Mascara","Ouargla",
  "Oran","El Bayadh","Illizi","Bordj Bou Arreridj",
  "Boumerdes","El Tarf","Tindouf","Tissemsilt","El Oued",
  "Khenchela","Souk Ahras","Tipaza","Mila","Ain Defla",
  "Naama","Ain Temouchent","Ghardaia","Relizane"
];

/* =========================
   LOAD OFFERS
========================= */
const loadOffers = async () => {
  loading.value = true;

  try {
    const res = await studentApi.offers(page.value, {
      search: search.value,
      type: typeFilter.value,
      wilaya: wilayaFilter.value,
      per_page: 9,
    });

    const data = res.data.data;

    offers.value = data.data;

    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      total: data.total,
    };

  } catch (error) {
    showToast("Failed loading offers");
  } finally {
    loading.value = false;
  }
};

/* =========================
   PAGINATION
========================= */
const changePage = (newPage) => {
  if (newPage < 1) return;
  if (newPage > pagination.value.last_page) return;

  page.value = newPage;
  loadOffers();
};

const reloadFirstPage = () => {
  page.value = 1;
  loadOffers();
};

/* =========================
   SEARCH DELAY
========================= */
let timer = null;

const debouncedSearch = () => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    reloadFirstPage();
  }, 400);
};

/* =========================
   CLEAR FILTERS
========================= */
const clearFilters = () => {
  search.value = "";
  typeFilter.value = "";
  wilayaFilter.value = "";
  reloadFirstPage();
};

/* =========================
   APPLY
========================= */
const applyOffer = async (id) => {
  try {
    await studentApi.apply(id, "Interested");

    showToast("Applied successfully");
    loadOffers();

  } catch (error) {
    showToast(
      error?.response?.data?.message ||
      "Cannot apply"
    );
  }
};

/* =========================
   SAVE
========================= */
const saveOffer = async (id) => {
  try {
    await studentApi.saveOffer(id);

    showToast("Offer saved");
    loadOffers();

  } catch (error) {
    showToast(
      error?.response?.data?.message ||
      "Cannot save"
    );
  }
};

/* =========================
   UNSAVE
========================= */
const unsaveOffer = async (id) => {
  try {
    await studentApi.unsaveOffer(id);

    showToast("Offer removed");
    loadOffers();

  } catch (error) {
    showToast(
      error?.response?.data?.message ||
      "Cannot unsave"
    );
  }
};

/* =========================
   HELPERS
========================= */
const shortText = (text) => {
  if (!text) return "";
  return text.length > 120
    ? text.slice(0, 120) + "..."
    : text;
};

const showToast = (msg) => {
  toast.value.show = true;
  toast.value.message = msg;

  setTimeout(() => {
    toast.value.show = false;
  }, 2500);
};

/* =========================
   INIT
========================= */
onMounted(loadOffers);
</script>

<style scoped>
.offers-page{
  padding:30px;
  color:white;
}

.offers-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  margin-bottom:25px;
}

.offers-header h1{
  margin:0;
}

.offers-header p{
  margin-top:6px;
  color:#9ca3af;
}

.filters{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:25px;
}

.input{
  padding:10px 14px;
  border:none;
  border-radius:10px;
  background:#1e1e2e;
  color:white;
  min-width:180px;
}

.refresh-btn,
.clear-btn{
  border:none;
  padding:10px 14px;
  border-radius:10px;
  cursor:pointer;
  color:white;
}

.refresh-btn{
  background:#4f46e5;
}

.clear-btn{
  background:#ef4444;
}

.loading,
.empty{
  text-align:center;
  padding:40px;
  color:#9ca3af;
}

.count{
  margin-bottom:18px;
  color:#9ca3af;
}

.grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:20px;
}

.card{
  background:#1e1e2e;
  padding:20px;
  border-radius:14px;
}

.card h3{
  margin-top:0;
}

.company{
  color:#818cf8;
  margin-bottom:10px;
}

.meta{
  font-size:14px;
  color:#9ca3af;
  margin:4px 0;
}

.desc{
  margin:14px 0;
  color:#e5e7eb;
  min-height:70px;
}

.actions{
  display:flex;
  gap:10px;
}

.apply,
.save,
.unsave{
  flex:1;
  border:none;
  padding:10px;
  border-radius:10px;
  cursor:pointer;
  color:white;
}

.apply{
  background:#22c55e;
}

.save{
  background:#3b82f6;
}

.unsave{
  background:#f59e0b;
}

.apply:disabled{
  opacity:.7;
  cursor:not-allowed;
}

.pagination{
  margin-top:30px;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:20px;
}

.pagination button{
  border:none;
  padding:10px 14px;
  border-radius:10px;
  cursor:pointer;
}

.toast{
  position:fixed;
  right:20px;
  bottom:20px;
  background:#22c55e;
  color:white;
  padding:12px 18px;
  border-radius:10px;
  z-index:999;
}

.fade-enter-active,
.fade-leave-active{
  transition:.3s;
}

.fade-enter-from,
.fade-leave-to{
  opacity:0;
}
</style>