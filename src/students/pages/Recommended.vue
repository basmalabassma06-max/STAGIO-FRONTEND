<template>
  <div class="page">
    <div class="page__header">
      <h1>Recommended for You 🎯</h1>
      <button class="btn btn--ghost" @click="load">↺ Refresh</button>
    </div>

    <div v-if="loading" class="page__loading">Loading...</div>

    <template v-else>
      <div v-if="offers.length === 0" class="empty">
        Complete your profile to get recommendations
      </div>

      <div class="cards-grid">
        <OfferCard
          v-for="o in offers"
          :key="o.id"
          :offer="o"
          @apply="apply"
          @save="save"
        />
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
import OfferCard from "../components/OfferCard.vue";

const offers = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const lastPage = ref(1);

const load = async (page = 1) => {
  loading.value = true;
  try {
    const res = await studentApi.recommended(page);
    offers.value = res.data.data.data;
    currentPage.value = res.data.data.current_page;
    lastPage.value = res.data.data.last_page;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const goTo = (p) => load(p);

const apply = async (id) => {
  try {
    await studentApi.apply(id, "Interested");
    load(currentPage.value);
  } catch (e) {
    alert(e.response?.data?.message || "Could not apply");
  }
};

const save = async (id) => {
  try {
    await studentApi.saveOffer(id);
    load(currentPage.value);
  } catch (e) {
    alert(e.response?.data?.message || "Could not save");
  }
};

onMounted(() => load());
</script>