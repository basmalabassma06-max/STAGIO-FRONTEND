<template>
  <div class="offer-card">
    <!-- Header -->
    <div class="offer-card__header">
      <h3 class="offer-card__title">{{ offer.title }}</h3>
      <div class="offer-card__badges">
        <span v-if="offer.score" class="score-badge">🎯 {{ offer.score }}%</span>
        <span v-if="offer.type" class="type-badge">{{ offer.type }}</span>
      </div>
    </div>

    <!-- Company info -->
    <div class="offer-card__info">
      <span class="info-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        {{ offer.company?.name ?? 'Unknown' }}
      </span>
      <span class="info-item" v-if="offer.company?.location || offer.wilaya">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        {{ offer.company?.location ?? offer.wilaya }}
      </span>
    </div>

    <!-- Skills -->
    <div class="offer-card__skills" v-if="offer.skills?.length">
      <span v-for="s in offer.skills.slice(0, 4)" :key="s.id" class="skill-chip">{{ s.name }}</span>
      <span v-if="offer.skills.length > 4" class="skill-chip skill-chip--more">
        +{{ offer.skills.length - 4 }}
      </span>
    </div>

    <!-- Deadline -->
    <div v-if="offer.deadline" class="offer-card__deadline" :class="{ expired: isExpired }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      {{ isExpired ? 'Expired' : `Deadline: ${formatDate(offer.deadline)}` }}
    </div>

    <!-- Actions -->
    <div class="offer-card__actions">
      <!-- ✅ FIX: route correcte → /student/offers/:id -->
      <router-link :to="`/student/offers/${offer.id}`" class="btn-details">
        View Details
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </router-link>

      <div class="offer-card__actions-right">
        <button
          class="btn-apply"
          @click="$emit('apply', offer.id)"
          :disabled="offer.applied || isExpired || !offer.is_active"
        >
          <svg v-if="offer.applied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ offer.applied ? 'Applied' : 'Apply' }}
        </button>

        <button
          :class="['btn-save', { saved: offer.saved }]"
          @click="offer.saved ? $emit('unsave', offer.id) : $emit('save', offer.id)"
          :title="offer.saved ? 'Remove from saved' : 'Save offer'"
        >
          <svg viewBox="0 0 24 24" :fill="offer.saved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" width="15" height="15">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  offer: {
    type: Object,
    required: true,
  },
});

defineEmits(["apply", "save", "unsave"]);

const isExpired = computed(() => {
  if (!props.offer.deadline) return false;
  return new Date(props.offer.deadline) < new Date();
});

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
</script>

<style scoped>
.offer-card {
  background: var(--bg2, #1e1e2e);
  border: 1px solid var(--border, #2e2e3e);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.offer-card:hover {
  border-color: var(--accent, #6366f1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.1);
}

/* ── Header ── */
.offer-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.offer-card__title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--text, #f1f1f1);
  line-height: 1.4;
  flex: 1;
}

.offer-card__badges {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex-shrink: 0;
}

.score-badge {
  padding: 3px 8px;
  background: #6366f118;
  color: #818cf8;
  border: 1px solid #6366f133;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.type-badge {
  padding: 3px 8px;
  background: var(--bg, #13131e);
  color: var(--muted, #8a8a9a);
  border: 1px solid var(--border, #2e2e3e);
  border-radius: 20px;
  font-size: 11px;
  text-transform: capitalize;
  white-space: nowrap;
}

/* ── Info ── */
.offer-card__info {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--muted, #8a8a9a);
}

.info-item svg { flex-shrink: 0; opacity: 0.7; }

/* ── Skills ── */
.offer-card__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.skill-chip {
  padding: 3px 10px;
  background: var(--bg, #13131e);
  border: 1px solid var(--border, #2e2e3e);
  border-radius: 20px;
  font-size: 11px;
  color: var(--text, #c4c4d4);
}

.skill-chip--more {
  color: var(--muted, #8a8a9a);
}

/* ── Deadline ── */
.offer-card__deadline {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--muted, #8a8a9a);
}

.offer-card__deadline.expired {
  color: #f97316;
}

/* ── Actions ── */
.offer-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--border, #2e2e3e);
}

.offer-card__actions-right {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn-details {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: transparent;
  border: 1px solid var(--border, #2e2e3e);
  border-radius: 8px;
  color: var(--text, #f1f1f1);
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-details:hover {
  border-color: var(--accent, #6366f1);
  color: var(--accent, #6366f1);
}

.btn-apply {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: var(--accent, #6366f1);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-apply:hover:not(:disabled) {
  background: #4f52e8;
}

.btn-apply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: transparent;
  border: 1px solid var(--border, #2e2e3e);
  border-radius: 8px;
  color: var(--muted, #8a8a9a);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-save:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.btn-save.saved {
  border-color: #ef4444;
  color: #ef4444;
  background: #ef444410;
}
</style>