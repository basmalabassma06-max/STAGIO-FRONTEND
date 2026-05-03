<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="modal__actions">
          <button class="btn btn--ghost"                            @click="$emit('cancel')">Cancel</button>
          <button :class="['btn', danger ? 'btn--danger' : 'btn--primary']" @click="$emit('confirm')">{{ label }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show:    Boolean,
  title:   { type: String, default: "Confirm" },
  message: { type: String, default: "Are you sure?" },
  label:   { type: String, default: "Confirm" },
  danger:  { type: Boolean, default: false },
});
defineEmits(["confirm", "cancel"]);
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.6);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: var(--bg2); border: 1px solid var(--border);
  border-radius: 14px; padding: 28px; max-width: 420px; width: 90%;
}
.modal h3 { margin-bottom: 10px; }
.modal p  { color: var(--muted); font-size: 14px; margin-bottom: 20px; }
.modal__actions { display: flex; gap: 10px; justify-content: flex-end; }
</style>