<template>
  <div class="page">
    <div class="page__header">
      <h1>My Applications</h1>
      <button class="btn btn--ghost" @click="load">↺ Refresh</button>
    </div>

    <div v-if="loading" class="page__loading">Loading...</div>

    <template v-else>
      <div v-if="apps.length === 0" class="empty">No applications yet</div>

      <div class="cards-grid">
        <ApplicationCard
          v-for="a in apps"
          :key="a.id"
          :app="a"
          @withdraw="withdraw"
          @updated="load"
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
import ApplicationCard from "../components/ApplicationCard.vue";

const apps = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const lastPage = ref(1);

const load = async (page = currentPage.value) => {
  loading.value = true;
  try {
    const res = await studentApi.myApplications(page);
    apps.value = res.data.data.data;
    currentPage.value = res.data.data.current_page;
    lastPage.value = res.data.data.last_page;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const goTo = (p) => load(p);

const withdraw = async (id) => {
  if (!confirm("Are you sure you want to withdraw?")) return;
  try {
    await studentApi.withdraw(id);
    load();
  } catch (e) {
    alert(e.response?.data?.message || "Could not withdraw");
  }
};

onMounted(() => load(1));
</script>