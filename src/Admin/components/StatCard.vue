<template>
  <div :class="['stat-card', color && `stat-card--${color}`]">
    <span class="stat-card__num">{{ value }}</span>
    <span class="stat-card__label">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps({ value: [String, Number], label: String, color: { type: String, default: "" } });
</script>