<template>
  <div class="page">
    <button class="btn btn--ghost" @click="$router.back()">← Back</button>

    <div class="form-card">
      <h1>{{ isEdit ? "Edit Offer" : "Create Offer" }}</h1>

      <div v-if="loadingOffer" class="page__loading">Loading offer…</div>

      <template v-else>
        <div class="form-grid">
          <div class="form-group">
            <label>Title *</label>
            <input v-model="form.title" placeholder="e.g. Frontend Developer Intern" />
          </div>
          <div class="form-group">
            <label>Location *</label>
            <input v-model="form.location" placeholder="e.g. Sétif" />
          </div>
          <div class="form-group">
            <label>Type *</label>
            <select v-model="form.type">
              <option value="">Select type…</option>
              <option value="internship">Internship</option>
              <option value="job">Job</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
          <div class="form-group">
            <label>Deadline</label>
            <input type="date" v-model="form.deadline" />
          </div>
        </div>

        <div class="form-group">
          <label>Description *</label>
          <textarea
            v-model="form.description"
            rows="5"
            placeholder="Describe the role, requirements, and benefits…"
          />
        </div>

        <div class="form-group">
          <label>Skills (comma-separated IDs)</label>
          <input v-model="skillsInput" placeholder="e.g. 1,2,3" />
          <p class="form__hint">Enter skill IDs separated by commas.</p>
        </div>

        <p v-if="error" class="form__msg form__msg--error">{{ error }}</p>
        <p v-if="success" class="form__msg">{{ success }}</p>

        <div style="display:flex;gap:10px;margin-top:8px">
          <button class="btn btn--primary" @click="submit" :disabled="saving">
            {{ saving ? "Saving…" : isEdit ? "Update Offer" : "Create Offer" }}
          </button>
          <button class="btn btn--ghost" @click="$router.back()">Cancel</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import companyApi from "../../services/companyApi";

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id);

const loadingOffer = ref(false);
const saving = ref(false);
const error = ref("");
const success = ref("");
const skillsInput = ref("");

const form = ref({
  title: "",
  description: "",
  location: "",
  type: "",
  deadline: "",
});

onMounted(async () => {
  if (!isEdit.value) return;
  loadingOffer.value = true;
  try {
    const res = await companyApi.myOffers({ per_page: 100 });
    // Fix: correct response parsing — Laravel paginate wraps in data.data
    const paged = res.data.data ?? res.data;
    const list = paged.data ?? [];
    const found = list.find((o) => String(o.id) === String(route.params.id));
    if (found) {
      form.value.title = found.title ?? "";
      form.value.description = found.description ?? "";
      form.value.location = found.location ?? "";
      form.value.type = found.type ?? "";
      form.value.deadline = found.deadline ? found.deadline.split("T")[0] : "";
      skillsInput.value = found.skills?.map((s) => s.id).join(",") ?? "";
    } else {
      error.value = "Offer not found.";
    }
  } catch {
    error.value = "Failed to load offer data.";
  } finally {
    loadingOffer.value = false;
  }
});

const submit = async () => {
  error.value = "";
  success.value = "";

  if (
    !form.value.title ||
    !form.value.description ||
    !form.value.location ||
    !form.value.type
  ) {
    error.value = "Title, description, location and type are required.";
    return;
  }

  const payload = {
    ...form.value,
    skills: skillsInput.value
      ? skillsInput.value
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter(Boolean)
      : [],
  };
  if (!payload.deadline) delete payload.deadline;

  saving.value = true;
  try {
    if (isEdit.value) {
      await companyApi.updateOffer(route.params.id, payload);
      success.value = "Offer updated ✓";
      setTimeout(() => router.push("/company/offers"), 1000);
    } else {
      await companyApi.createOffer(payload);
      success.value = "Offer created ✓";
      setTimeout(() => router.push("/company/offers"), 1000);
    }
  } catch (e) {
    const errs = e.response?.data?.errors;
    if (errs) {
      error.value = Object.values(errs).flat().join(" | ");
    } else {
      error.value =
        e.response?.data?.error ||
        e.response?.data?.message ||
        "Failed to save offer.";
    }
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.form-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 16px;
}

.form-card h1 {
  font-size: 22px;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 560px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  outline: none;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--accent);
}

.form-group textarea {
  resize: vertical;
}

.form__hint {
  font-size: 12px;
  color: var(--muted);
  margin: 0;
}

.form__msg {
  font-size: 13px;
  color: #3dba7a;
  margin: 0;
}

.form__msg--error {
  color: #e05a5a;
}

.page__loading {
  color: var(--muted);
  font-size: 14px;
  padding: 16px 0;
}
</style>