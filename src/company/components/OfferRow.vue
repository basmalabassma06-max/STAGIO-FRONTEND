<template>
  <div class="offer-row">
    <div class="offer-row__info">
      <h4>{{ offer.title }}</h4>
      <p class="text-muted text-sm">
        📍 {{ offer.location }} &nbsp;•&nbsp; {{ offer.type }}
        <span v-if="offer.deadline"> &nbsp;•&nbsp; ⏳ {{ fmtDate(offer.deadline) }}</span>
      </p>
      <div v-if="offer.skills?.length" class="offer-row__skills">
        <span v-for="s in offer.skills" :key="s.id" class="chip">{{ s.name }}</span>
      </div>
    </div>

    <div class="offer-row__right">
      <span :class="['badge', offer.is_active ? 'badge--success' : 'badge--neutral']">
        {{ offer.is_active ? "Active" : "Inactive" }}
      </span>
      <span class="text-muted text-sm">{{ offer.applications_count ?? 0 }} applicants</span>

      <div style="display:flex;gap:6px">
        <button class="btn btn--sm btn--ghost"    @click="$emit('toggle', offer.id)">
          {{ offer.is_active ? "Deactivate" : "Activate" }}
        </button>
        <router-link :to="`/company/offers/${offer.id}/edit`" class="btn btn--sm btn--outline">Edit</router-link>
        <button class="btn btn--sm btn--danger"   @click="$emit('delete', offer.id)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(["offer"]);
defineEmits(["toggle", "delete"]);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : "";
</script>