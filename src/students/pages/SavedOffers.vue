<template>
  <div class="page">
    <div class="page__header">
      <h1>Saved Offers ❤️</h1>
      <button class="btn btn--ghost" @click="load">↺ Refresh</button>
    </div>

    <div v-if="loading" class="page__loading">Loading...</div>

    <template v-else>
      <div v-if="offers.length === 0" class="empty">No saved offers yet</div>

      <div class="cards-grid">
        <div v-for="o in offers" :key="o.id" class="offer-card">
          <div class="offer-card__header">
            <h3 class="offer-card__title">{{ o.title }}</h3>
          </div>
          <p class="offer-card__company">🏢 {{ o.company?.name }}</p>
          <p class="offer-card__location">📍 {{ o.company?.location }}</p>
          <div class="offer-card__actions">
            <router-link
  :to="{ name: 'offerDetails', params: { id: o.id } }"
  class="btn btn--outline"
>
  Details →
</router-link>
            <button class="btn btn--danger" @click="remove(o.id)">Remove</button>
          </div>
        </div>
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

const offers = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const lastPage = ref(1);

const load = async (page = 1) => {
  loading.value = true;
  try {
    const res = await studentApi.savedOffers(page);
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

const remove = async (id) => {
  try {
    await studentApi.unsaveOffer(id);
    load(currentPage.value);
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => load());
</script>