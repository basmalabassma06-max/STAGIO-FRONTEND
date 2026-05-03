<template>
  <div class="detail-page">
    <!-- Back Button -->
    <button class="btn-back" @click="$router.back()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Back to offers
    </button>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="detail-skeleton">
        <div class="sk-badge"></div>
        <div class="sk-title"></div>
        <div class="sk-sub"></div>
        <div class="sk-sub short"></div>
        <div class="sk-chips">
          <div class="sk-chip" v-for="i in 4" :key="i"></div>
        </div>
        <div class="sk-block"></div>
        <div class="sk-block small"></div>
      </div>
    </div>

    <!-- Error / Not found -->
    <div v-else-if="error" class="error-state">
      <div class="error-state__icon">⚠️</div>
      <h3>{{ error }}</h3>
      <p>The offer may have been removed or is no longer available.</p>
      <button class="btn-primary" @click="$router.push('/student/offers')">Browse offers</button>
    </div>

    <!-- Offer Details -->
    <div v-else-if="offer" class="detail-card">

      <!-- Top badges -->
      <div class="detail-card__badges">
        <span :class="['badge', offer.is_active ? 'badge--active' : 'badge--inactive']">
          {{ offer.is_active ? '● Active' : '● Closed' }}
        </span>
        <span v-if="offer.type" class="badge badge--type">{{ offer.type }}</span>
        <span v-if="isExpired" class="badge badge--expired">Expired</span>
      </div>

      <!-- Title -->
      <h1 class="detail-card__title">{{ offer.title }}</h1>

      <!-- Company info -->
      <div class="detail-card__meta-row">
        <div class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <span>{{ offer.company?.name ?? 'Unknown company' }}</span>
        </div>
        <div class="meta-item" v-if="offer.company?.location || offer.wilaya">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ offer.company?.location ?? offer.wilaya }}</span>
        </div>
        <div class="meta-item" v-if="offer.deadline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span :class="{ 'text-expired': isExpired }">
            Deadline: {{ formatDate(offer.deadline) }}
          </span>
        </div>
      </div>

      <!-- Divider -->
      <hr class="divider" />

      <!-- Skills -->
      <div v-if="offer.skills?.length" class="detail-section">
        <h4 class="section-label">Required Skills</h4>
        <div class="skills-list">
          <span v-for="s in offer.skills" :key="s.id" class="skill-chip">{{ s.name }}</span>
        </div>
      </div>

      <!-- Description -->
      <div v-if="offer.description" class="detail-section">
        <h4 class="section-label">About this position</h4>
        <p class="description-text">{{ offer.description }}</p>
      </div>

      <!-- Actions -->
      <div class="detail-card__actions">
        <button
          class="btn-apply"
          @click="handleApply"
          :disabled="applyLoading || applied || !offer.is_active || isExpired"
        >
          <svg v-if="applyLoading" class="btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/>
            <path d="M21 12a9 9 0 00-9-9"/>
          </svg>
          <svg v-else-if="applied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ applied ? 'Applied' : applyLoading ? 'Sending...' : 'Apply Now' }}
        </button>

        <button
          :class="['btn-save', { saved }]"
          @click="handleSave"
          :disabled="saveLoading"
        >
          <svg viewBox="0 0 24 24" :fill="saved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          {{ saved ? 'Saved' : 'Save' }}
        </button>
      </div>

      <!-- Message banner -->
      <Transition name="fade">
        <div v-if="message" :class="['message-banner', `message-banner--${messageType}`]">
          {{ message }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import studentApi from "../../services/studentApi";

const route = useRoute();
const router = useRouter();

const offer = ref(null);
const loading = ref(true);
const error = ref(null);

const applied = ref(false);
const applyLoading = ref(false);
const saved = ref(false);
const saveLoading = ref(false);

const message = ref("");
const messageType = ref("success");

// ✅ FIX: use route.params.id safely
const offerId = computed(() => route.params.id);

const isExpired = computed(() => {
  if (!offer.value?.deadline) return false;
  return new Date(offer.value.deadline) < new Date();
});

const loadOffer = async () => {
  if (!offerId.value) {
    error.value = "Offer not found";
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const res = await studentApi.offerDetails(offerId.value);

    // ✅ FIX: Backend wraps response in { success, data }
    // Try both patterns to be safe
    const data = res.data?.data ?? res.data;

    if (!data || !data.id) {
      error.value = "Offer not found";
      return;
    }

    offer.value = {
      ...data,
      skills: data.skills ?? [],
    };

    applied.value = !!data.applied;
    saved.value = !!data.saved;
  } catch (e) {
    if (e.response?.status === 404) {
      error.value = "Offer not found";
    } else if (e.response?.status === 403) {
      error.value = "Access denied";
    } else {
      error.value = "Failed to load offer. Please try again.";
    }
    console.error("Failed to load offer:", e);
  } finally {
    loading.value = false;
  }
};

const handleApply = async () => {
  applyLoading.value = true;
  try {
    await studentApi.apply(offerId.value, "Interested in this position");
    applied.value = true;
    showMessage("Application sent successfully ✓", "success");
  } catch (e) {
    showMessage(e.response?.data?.message || "Could not apply", "error");
  } finally {
    applyLoading.value = false;
  }
};

const handleSave = async () => {
  saveLoading.value = true;
  try {
    if (saved.value) {
      await studentApi.unsaveOffer(offerId.value);
      saved.value = false;
      showMessage("Removed from saved offers", "info");
    } else {
      await studentApi.saveOffer(offerId.value);
      saved.value = true;
      showMessage("Offer saved ✓", "success");
    }
  } catch (e) {
    showMessage(e.response?.data?.message || "Action failed", "error");
  } finally {
    saveLoading.value = false;
  }
};

const showMessage = (msg, type = "success") => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => (message.value = ""), 3500);
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

onMounted(() => loadOffer());
</script>

<style scoped>
/* ── Base ── */
.detail-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Back Button ── */
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg2, #1e1e2e);
  border: 1px solid var(--border, #2e2e3e);
  border-radius: 8px;
  color: var(--muted, #8a8a9a);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.btn-back:hover {
  color: var(--text, #f1f1f1);
  border-color: var(--accent, #6366f1);
}

/* ── Loading Skeleton ── */
.detail-skeleton {
  background: var(--bg2, #1e1e2e);
  border: 1px solid var(--border, #2e2e3e);
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.sk-badge { width: 80px; height: 22px; background: var(--border, #2e2e3e); border-radius: 20px; }
.sk-title { width: 65%; height: 28px; background: var(--border, #2e2e3e); border-radius: 6px; }
.sk-sub { width: 45%; height: 14px; background: var(--border, #2e2e3e); border-radius: 6px; }
.sk-sub.short { width: 30%; }
.sk-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.sk-chip { width: 64px; height: 26px; background: var(--border, #2e2e3e); border-radius: 20px; }
.sk-block { width: 100%; height: 80px; background: var(--border, #2e2e3e); border-radius: 8px; }
.sk-block.small { height: 40px; }

/* ── Error / 404 ── */
.error-state {
  text-align: center;
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-state__icon { font-size: 48px; }

.error-state h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text, #f1f1f1);
}

.error-state p {
  font-size: 14px;
  color: var(--muted, #8a8a9a);
  margin: 0;
}

.btn-primary {
  margin-top: 8px;
  padding: 10px 22px;
  background: var(--accent, #6366f1);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover { opacity: 0.88; }

/* ── Detail Card ── */
.detail-card {
  background: var(--bg2, #1e1e2e);
  border: 1px solid var(--border, #2e2e3e);
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── Badges ── */
.detail-card__badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge--active   { background: #22c55e18; color: #22c55e; border: 1px solid #22c55e33; }
.badge--inactive { background: #ef444418; color: #ef4444; border: 1px solid #ef444433; }
.badge--expired  { background: #f9731618; color: #f97316; border: 1px solid #f9731633; }
.badge--type     { background: #6366f118; color: #818cf8; border: 1px solid #6366f133; text-transform: capitalize; }

/* ── Title ── */
.detail-card__title {
  font-size: clamp(20px, 3vw, 26px);
  font-weight: 700;
  margin: 0;
  color: var(--text, #f1f1f1);
  line-height: 1.3;
}

/* ── Meta Row ── */
.detail-card__meta-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--muted, #8a8a9a);
}

.meta-item svg { flex-shrink: 0; opacity: 0.7; }

.text-expired { color: #f97316; }

/* ── Divider ── */
.divider {
  border: none;
  border-top: 1px solid var(--border, #2e2e3e);
  margin: 0;
}

/* ── Sections ── */
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted, #8a8a9a);
  margin: 0;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.skill-chip {
  padding: 5px 12px;
  background: var(--bg, #13131e);
  border: 1px solid var(--border, #2e2e3e);
  border-radius: 20px;
  font-size: 12px;
  color: var(--text, #f1f1f1);
}

.description-text {
  font-size: 14px;
  line-height: 1.75;
  color: var(--text, #c4c4d4);
  margin: 0;
  white-space: pre-wrap;
}

/* ── Actions ── */
.detail-card__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.btn-apply {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 24px;
  background: var(--accent, #6366f1);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-apply:hover:not(:disabled) {
  background: #4f52e8;
  transform: translateY(-1px);
}

.btn-apply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: transparent;
  border: 1px solid var(--border, #2e2e3e);
  border-radius: 10px;
  color: var(--muted, #8a8a9a);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  border-color: #ef4444;
  color: #ef4444;
}

.btn-save.saved {
  border-color: #ef4444;
  color: #ef4444;
  background: #ef444410;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Message Banner ── */
.message-banner {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.message-banner--success { background: #22c55e18; color: #22c55e; border: 1px solid #22c55e33; }
.message-banner--error   { background: #ef444418; color: #ef4444; border: 1px solid #ef444433; }
.message-banner--info    { background: #3b82f618; color: #60a5fa; border: 1px solid #3b82f633; }

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .detail-page { padding: 20px 16px 48px; }
  .detail-card { padding: 22px 18px; }
  .detail-card__meta-row { gap: 12px; }
}
</style>