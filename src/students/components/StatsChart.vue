<template>
  <div class="stats-chart">
    <div v-if="loading" class="stats-chart__loading">Loading chart...</div>
    <canvas v-else ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";
import studentApi from "../../services/studentApi";

const chartRef = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await studentApi.stats();
    const d = res.data.data;
    loading.value = false;

    await new Promise((r) => setTimeout(r, 50));

    new Chart(chartRef.value, {
      type: "bar",
      data: {
        labels: ["Total", "Accepted", "Rejected", "Validated"],
        datasets: [
          {
            label: "Applications",
            data: [
              d.total_applications,
              d.accepted,
              d.rejected,
              d.validated,
            ],
            backgroundColor: ["#6366f1", "#22c55e", "#ef4444", "#f59e0b"],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });
  } catch (e) {
    loading.value = false;
    console.error(e);
  }
});
</script>