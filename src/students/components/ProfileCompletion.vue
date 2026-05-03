<template>
  <div class="completion">
    <div class="completion__top">
      <span>Profile Completion</span>
      <span class="completion__pct">{{ value }}%</span>
    </div>
    <div class="completion__bar">
      <div class="completion__fill" :style="{ width: value + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({ value: { type: Number, default: 0 } });
</script>