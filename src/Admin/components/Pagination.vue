<template>
  <div class="pagination" v-if="lastPage > 1">
    <button class="btn btn--ghost btn--sm" :disabled="current === 1"        @click="$emit('change', current - 1)">←</button>
    <button
      v-for="p in pages" :key="p"
      :class="['btn btn--sm', p === current ? 'btn--primary' : 'btn--ghost']"
      @click="$emit('change', p)"
    >{{ p }}</button>
    <button class="btn btn--ghost btn--sm" :disabled="current === lastPage" @click="$emit('change', current + 1)">→</button>
  </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({ current: Number, lastPage: Number });
defineEmits(["change"]);
const pages = computed(() => {
  const d = 2, out = [];
  for (let i = Math.max(1, props.current - d); i <= Math.min(props.lastPage, props.current + d); i++) out.push(i);
  return out;
});
</script>