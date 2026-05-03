<template>
  <div class="page">
    <h1>Statistics 📊</h1>

    <div v-if="data" class="stat-grid">
      <div class="stat-card">
        <span class="stat-card__num">{{ data.total_applications }}</span>
        <span class="stat-card__label">Total</span>
      </div>
      <div class="stat-card stat-card--success">
        <span class="stat-card__num">{{ data.accepted }}</span>
        <span class="stat-card__label">Accepted</span>
      </div>
      <div class="stat-card stat-card--danger">
        <span class="stat-card__num">{{ data.rejected }}</span>
        <span class="stat-card__label">Rejected</span>
      </div>
      <div class="stat-card stat-card--gold">
        <span class="stat-card__num">{{ data.validated }}</span>
        <span class="stat-card__label">Validated</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__num">{{ data.success_rate }}%</span>
        <span class="stat-card__label">Success Rate</span>
      </div>
    </div>

    <div class="card" style="margin-top: 24px">
      <StatsChart />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import studentApi from "../../services/studentApi";
import StatsChart from "../components/StatsChart.vue"

const data = ref(null);

onMounted(async () => {
  try {
    const res = await studentApi.stats();
    data.value = res.data.data;
  } catch (e) {
    console.error(e);
  }
});
</script>