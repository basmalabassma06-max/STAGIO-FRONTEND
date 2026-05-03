<template>
  <div class="intern-row">
    <div class="intern-row__info">
      <h4>{{ item.offer?.title || "—" }}</h4>
      <p class="text-muted text-sm">
        👤 {{ item.student?.user?.name || item.student?.name || "—" }}
        &nbsp;•&nbsp;
        🏢 {{ item.company?.name || "—" }}
      </p>
      <p class="text-muted text-sm">📅 {{ fmtDate(item.created_at) }}</p>
    </div>

    <div class="intern-row__right">
      <StatusBadge :status="item.status" />

      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <router-link :to="`/admin/internships/${item.id}`" class="btn btn--sm btn--ghost">View →</router-link>

        <template v-if="item.status === 'pending_admin'">
          <button class="btn btn--sm btn--success" @click="$emit('validate', item.id)">✓ Validate</button>
          <button class="btn btn--sm btn--danger"  @click="$emit('reject',   item.id)">✗ Reject</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from "./StatusBadge.vue";
defineProps(["item"]);
defineEmits(["validate", "reject"]);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : "";
</script>