<template>
  <div class="app-card">
    <div class="app-card__header">
      <div>
        <h4>{{ app.student?.user?.name || "—" }}</h4>
        <p class="text-muted text-sm">{{ app.student?.user?.email }}</p>
        <p class="text-muted text-sm">📋 {{ app.offer?.title }}</p>
      </div>
      <StatusBadge :status="app.status" />
    </div>

    <p v-if="app.motivation" class="app-card__motivation">{{ app.motivation }}</p>

    <div class="app-card__footer">
      <span class="text-muted text-sm">{{ fmtDate(app.created_at) }}</span>

      <div style="display:flex;gap:8px;align-items:center">
        <template v-if="app.status === 'pending'">
          <button class="btn btn--sm btn--success" @click="$emit('accept', app.id)">✓ Accept</button>
          <button class="btn btn--sm btn--danger"  @click="$emit('reject', app.id)">✗ Reject</button>
        </template>
        <router-link :to="`/company/applications/${app.id}`" class="btn btn--sm btn--ghost">View →</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from "./StatusBadge.vue";
defineProps(["app"]);
defineEmits(["accept", "reject"]);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : "";
</script>