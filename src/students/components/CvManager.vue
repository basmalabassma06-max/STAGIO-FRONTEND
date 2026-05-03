<template>
  <div class="cv-manager">

    <!-- ── Header ── -->
    <div class="cv-manager__header">
      <h3>Digital CV</h3>
      <span class="cv-manager__pct" :class="pctClass">{{ fillPct }}% filled</span>
    </div>

    <!-- ── Mini progress bar ── -->
    <div class="cv-bar">
      <div class="cv-bar__fill" :style="{ width: fillPct + '%' }" :class="pctClass" />
    </div>

    <!-- ── Empty state ── -->
    <p v-if="fillPct === 0" class="cv-manager__empty">
      ✏️ Fill in your Digital CV so companies can learn about you.
    </p>

    <!-- ── Form ── -->
    <div class="form-group">
      <label>Summary <span class="req">*</span></label>
      <textarea
        v-model="form.cv_summary"
        placeholder="Brief professional summary — who you are, what you're looking for…"
        rows="3"
        maxlength="2000"
      />
      <small>{{ (form.cv_summary || '').length }} / 2000</small>
    </div>

    <div class="form-group">
      <label>Education <span class="req">*</span></label>
      <textarea
        v-model="form.education"
        placeholder="e.g. Bachelor of Computer Science — Université Ferhat Abbas, 2021–2024"
        rows="3"
      />
    </div>

    <div class="form-group">
      <label>Experience</label>
      <textarea
        v-model="form.experience"
        placeholder="e.g. Frontend Intern — Sonatrach, Summer 2023 (describe what you did)"
        rows="3"
      />
    </div>

    <div class="form-group">
      <label>Projects</label>
      <textarea
        v-model="form.projects"
        placeholder="e.g. E-commerce app in Laravel + Vue — github.com/you/project"
        rows="3"
      />
    </div>

    <div class="form-group">
      <label>Languages</label>
      <input
        v-model="form.cv_languages"
        placeholder="e.g. Arabic (native), French (B2), English (B1)"
        maxlength="500"
      />
    </div>

    <!-- ── Actions ── -->
    <div class="cv-manager__actions">
      <button class="btn btn--primary" @click="save" :disabled="saving || !isDirty">
        {{ saving ? "Saving…" : "Save CV" }}
      </button>

      <button
        class="btn btn--ghost"
        @click="showPreview = !showPreview"
        :disabled="fillPct === 0"
      >
        {{ showPreview ? "Hide Preview" : "Preview CV" }}
      </button>
      <button class="btn btn--ghost" @click="downloadPdf">
  Download PDF CV
</button>

      <button class="btn btn--danger" @click="clear" :disabled="clearing || fillPct === 0">
        {{ clearing ? "Clearing…" : "Clear CV" }}
      </button>
    </div>

    <p v-if="msg" :class="['form__msg', msgOk ? 'form__msg--ok' : 'form__msg--err']">
      {{ msg }}
    </p>

    <!-- ── Preview card ── -->
    <transition name="fade">
      <div v-if="showPreview && fillPct > 0" class="cv-preview">
        <h4>CV Preview</h4>

        <section v-if="form.cv_summary">
          <strong>Summary</strong>
          <p>{{ form.cv_summary }}</p>
        </section>

        <section v-if="form.education">
          <strong>Education</strong>
          <p>{{ form.education }}</p>
        </section>

        <section v-if="form.experience">
          <strong>Experience</strong>
          <p>{{ form.experience }}</p>
        </section>

        <section v-if="form.projects">
          <strong>Projects</strong>
          <p>{{ form.projects }}</p>
        </section>

        <section v-if="form.cv_languages">
          <strong>Languages</strong>
          <p>{{ form.cv_languages }}</p>
        </section>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import studentApi from "../../services/studentApi";

const emit = defineEmits(["updated"]);

// ── State ──
const form = ref({
  cv_summary:    "",
  education:     "",
  experience:    "",
  projects:      "",
  cv_languages:  "",
});

const saved      = ref({ ...form.value }); // snapshot for dirty check
const saving     = ref(false);
const clearing   = ref(false);
const msg        = ref("");
const msgOk      = ref(true);
const showPreview = ref(false);

// ── Dirty check ──
const isDirty = computed(() =>
  Object.keys(form.value).some((k) => form.value[k] !== saved.value[k])
);

// ── CV fill percentage (5 fields, each worth 20%) ──
const fillPct = computed(() => {
  const fields = Object.values(form.value);
  const filled = fields.filter((v) => v && v.trim()).length;
  return Math.round((filled / fields.length) * 100);
});

const pctClass = computed(() => {
  if (fillPct.value >= 80) return "pct--high";
  if (fillPct.value >= 40) return "pct--mid";
  return "pct--low";
});

// ── Load ──
const load = async () => {
  try {
    const res = await studentApi.profile();
    const s   = res.data.data.user?.student || {};
    form.value = {
      cv_summary:   s.cv_summary   || "",
      education:    s.education    || "",
      experience:   s.experience   || "",
      projects:     s.projects     || "",
      cv_languages: s.cv_languages || "",
    };
    saved.value = { ...form.value };
  } catch (err) {
    console.error(err);
  }
};

// ── Save ──
const save = async () => {
  saving.value = true;
  msg.value    = "";
  try {
    const fd = new FormData();
    Object.entries(form.value).forEach(([k, v]) => {
      // send even empty string so backend can clear individual fields
      fd.append(k, v ?? "");
    });
    await studentApi.updateProfile(fd);
    saved.value = { ...form.value };
    msgOk.value = true;
    msg.value   = "Digital CV saved ✓";
    emit("updated");
  } catch (err) {
    msgOk.value = false;
    msg.value   = err.response?.data?.message || "Save failed";
  } finally {
    saving.value = false;
  }
};
const downloadPdf = async () => {
  try {
    const res = await studentApi.downloadCvPdf();

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "My_CV.pdf");

    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (err) {
    alert("Failed to download CV");
  }
};

// ── Clear (only cv_summary + cv_languages; shared fields stay) ──
const clear = async () => {
  if (!confirm("Clear your Digital CV summary and languages? (Education, Experience and Projects will stay on your profile)")) return;
  clearing.value = true;
  msg.value      = "";
  try {
    await studentApi.clearDigitalCv();
    form.value.cv_summary   = "";
    form.value.cv_languages = "";
    saved.value = { ...form.value };
    msgOk.value = true;
    msg.value   = "Digital CV cleared";
    showPreview.value = false;
    emit("updated");
  } catch (err) {
    msgOk.value = false;
    msg.value   = err.response?.data?.message || "Clear failed";
  } finally {
    clearing.value = false;
  }
};

onMounted(load);
</script>

<style scoped>
.cv-manager { display: flex; flex-direction: column; gap: 16px; }

/* header */
.cv-manager__header { display: flex; align-items: center; justify-content: space-between; }
.cv-manager__pct    { font-size: 13px; font-weight: 600; }

/* progress bar */
.cv-bar             { height: 6px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
.cv-bar__fill       { height: 100%; border-radius: 99px; transition: width .4s ease; }

/* pct colours */
.pct--low  { color: #dc2626; background: #dc2626; }
.pct--mid  { color: #d97706; background: #d97706; }
.pct--high { color: #16a34a; background: #16a34a; }

/* empty state */
.cv-manager__empty { color: #6b7280; font-size: 14px; }

/* char counter */
small { color: #9ca3af; font-size: 12px; }

/* required star */
.req { color: #dc2626; }

/* actions */
.cv-manager__actions { display: flex; gap: 10px; flex-wrap: wrap; }

.btn          { border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; }
.btn--primary { background: #2563eb; color: #fff; }
.btn--ghost   { background: #f3f4f6; color: #374151; }
.btn--danger  { background: #dc2626; color: #fff; }
.btn:disabled { opacity: .5; cursor: not-allowed; }

/* feedback */
.form__msg     { font-size: 14px; font-weight: 600; }
.form__msg--ok  { color: #16a34a; }
.form__msg--err { color: #dc2626; }

/* preview card */
.cv-preview        { border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.cv-preview h4     { margin: 0; font-size: 15px; color: #111827; }
.cv-preview section { display: flex; flex-direction: column; gap: 4px; }
.cv-preview strong  { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; }
.cv-preview p       { margin: 0; font-size: 14px; color: #374151; white-space: pre-line; }

/* fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }
</style>