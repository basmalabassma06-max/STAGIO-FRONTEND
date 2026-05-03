<template>
  <div class="page">
    <button class="btn btn--ghost" @click="$router.back()">← Back</button>

    <div v-if="loading" class="page__loading">Loading…</div>

    <template v-else-if="app">
      <div class="detail-card">
        <!-- HEADER -->
        <div class="detail-card__header">
          <div>
            <h1>{{ app.offer?.title }}</h1>
            <p class="text-muted">
              Applied {{ fmtDate(app.created_at) }}
            </p>
          </div>

          <StatusBadge :status="app.status" />
        </div>

        <!-- STUDENT INFO -->
        <section class="detail-section">
          <h3>Student</h3>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Name</span>
              <span>{{ app.student?.user?.name || "—" }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Email</span>
              <span>{{ app.student?.user?.email || "—" }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">University</span>
              <span>{{ app.student?.university || "—" }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Wilaya</span>
              <span>{{ app.student?.wilaya || "—" }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Phone</span>
              <span>{{ app.student?.phone || "—" }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">GitHub</span>

              <a
                v-if="app.student?.github_link"
                :href="app.student.github_link"
                target="_blank"
              >
                {{ app.student.github_link }}
              </a>

              <span v-else>—</span>
            </div>

            <div class="info-item">
              <span class="info-label">LinkedIn</span>

              <a
                v-if="app.student?.linkedin"
                :href="app.student.linkedin"
                target="_blank"
              >
                {{ app.student.linkedin }}
              </a>

              <span v-else>—</span>
            </div>
          </div>
        </section>

        <!-- SKILLS -->
        <section
          v-if="app.student?.skills?.length"
          class="detail-section"
        >
          <h3>Skills</h3>

          <div class="chips-row">
            <span
              v-for="s in app.student.skills"
              :key="s.id"
              class="chip"
            >
              {{ s.name }}
            </span>
          </div>
        </section>

        <!-- MOTIVATION -->
        <section
          v-if="app.motivation"
          class="detail-section"
        >
          <h3>Motivation Letter</h3>

          <p class="motivation-text">
            {{ app.motivation }}
          </p>
        </section>

        <!-- CV -->
        <section class="detail-section">
          <h3>CV</h3>

          <button
            class="btn btn--outline"
            @click="downloadCv"
            :disabled="cvLoading"
          >
            {{ cvLoading ? "Downloading..." : "⬇ Download CV" }}
          </button>
        </section>

        <!-- ACTIONS -->
        <div
          v-if="app.status === 'pending'"
          class="detail-card__actions"
        >
          <button
            class="btn btn--success"
            @click="accept"
            :disabled="actLoading"
          >
            ✓ Accept
          </button>

          <button
            class="btn btn--danger"
            @click="reject"
            :disabled="actLoading"
          >
            ✗ Reject
          </button>
        </div>

        <!-- MESSAGE -->
        <p
          v-if="message"
          :class="[
            'form__msg',
            msgType === 'error'
              ? 'form__msg--error'
              : ''
          ]"
        >
          {{ message }}
        </p>
      </div>
    </template>

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

import companyApi from "../../services/companyApi";

import StatusBadge from "../components/StatusBadge.vue";
import Toast from "../components/Toast.vue";

const route = useRoute();

const app = ref(null);
const loading = ref(true);
const actLoading = ref(false);
const cvLoading = ref(false);

const message = ref("");
const msgType = ref("success");

const toast = ref(null);

/* LOAD */
onMounted(async () => {
  try {
    const res = await companyApi.showApplication(
      route.params.id
    );

    app.value = res.data.data;
  } catch {
    toast.value?.notify(
      "Failed to load application",
      "error"
    );
  } finally {
    loading.value = false;
  }
});

/* ACCEPT */
const accept = async () => {
  actLoading.value = true;

  try {
    await companyApi.acceptApplication(
      route.params.id
    );

    const res = await companyApi.showApplication(
      route.params.id
    );

    app.value = res.data.data;

    message.value =
      "Application accepted ✓ Internship created.";
    msgType.value = "success";
  } catch (e) {
    message.value =
      e.response?.data?.message || "Error";

    msgType.value = "error";
  } finally {
    actLoading.value = false;
  }
};

/* REJECT */
const reject = async () => {
  actLoading.value = true;

  try {
    await companyApi.rejectApplication(
      route.params.id
    );

    const res = await companyApi.showApplication(
      route.params.id
    );

    app.value = res.data.data;

    message.value = "Application rejected.";
    msgType.value = "success";
  } catch (e) {
    message.value =
      e.response?.data?.message || "Error";

    msgType.value = "error";
  } finally {
    actLoading.value = false;
  }
};

/* DOWNLOAD CV */
const downloadCv = async () => {
  cvLoading.value = true;

  try {
    const res =
      await companyApi.downloadStudentCv(
        route.params.id
      );

    const blob = new Blob(
      [res.data],
      { type: "application/pdf" }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = "Student_CV.pdf";
    link.click();

    window.URL.revokeObjectURL(url);
  } catch {
    toast.value?.notify(
      "Failed to download CV",
      "error"
    );
  } finally {
    cvLoading.value = false;
  }
};

/* DATE */
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString()
    : "";
</script>

<style scoped>
.detail-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
}

.detail-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.detail-card__actions {
  display: flex;
  gap: 10px;
}

.detail-section h3 {
  margin-bottom: 12px;
  font-size: 15px;
  color: var(--muted);
}

.info-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-label {
  font-size: 12px;
  color: var(--muted);
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 13px;
}

.motivation-text {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  font-size: 14px;
  line-height: 1.7;
}

.form__msg {
  font-size: 13px;
  color: var(--success);
}

.form__msg--error {
  color: var(--danger);
}
</style>