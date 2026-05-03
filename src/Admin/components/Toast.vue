<template>
  <Transition name="toast">
    <div v-if="show" :class="['toast', `toast--${type}`]">{{ message }}</div>
  </Transition>
</template>

<script setup>
import { ref } from "vue";
const show = ref(false), message = ref(""), type = ref("success");
const notify = (msg, t = "success") => {
  message.value = msg; type.value = t; show.value = true;
  setTimeout(() => (show.value = false), 3000);
};
defineExpose({ notify });
</script>

<style scoped>
.toast { position:fixed; bottom:24px; right:24px; padding:12px 20px; border-radius:10px; font-size:14px; font-weight:500; z-index:9999; box-shadow:0 8px 24px rgba(0,0,0,.4); }
.toast--success { background:#22c55e; color:#fff; }
.toast--error   { background:#ef4444; color:#fff; }
.toast--info    { background:#6366f1; color:#fff; }
.toast-enter-active,.toast-leave-active { transition:all .3s; }
.toast-enter-from,.toast-leave-to { opacity:0; transform:translateY(12px); }
</style>