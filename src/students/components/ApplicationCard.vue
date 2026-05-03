<template>
  <div class="app-card">
    <div class="app-card__header">
      <div>
        <h3 class="app-card__title">{{ app.offer?.title }}</h3>
        <p class="app-card__company">{{ app.offer?.company?.name }}</p>
      </div>
      <span :class="['badge', statusClass]">{{ formatStatus(app.status) }}</span>
    </div>

    <textarea
      v-model="motivation"
      class="app-card__textarea"
      placeholder="Update your motivation letter..."
      :disabled="app.status !== 'pending'"
    />

    <div class="app-card__actions">
      <button
        v-if="app.status === 'pending'"
        class="btn btn--primary"
        @click="update"
        :disabled="loading"
      >
        {{ loading ? "Saving..." : "Update" }}
      </button>
      <button class="btn btn--danger" @click="$emit('withdraw', app.id)">
        Withdraw
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import studentApi from "../../services/studentApi";

const props = defineProps(["app"]);
const emit = defineEmits(["withdraw", "updated"]);

const motivation = ref(props.app.motivation || "");
const loading = ref(false);

const statusClass = computed(() => {
  const s = props.app.status;
  if (s?.includes("accepted")) return "badge--success";
  if (s?.includes("rejected")) return "badge--danger";
  if (s === "withdrawn") return "badge--neutral";
  return "badge--warning";
});

const formatStatus = (s) =>
  s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

const update = async () => {
  loading.value = true;
  try {
    await studentApi.updateApplication(props.app.id, { motivation: motivation.value });
    emit("updated");
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};
</script>