<template>
  <div class="page">
    <h1>Company Profile 🏢</h1>

    <div v-if="loading" class="page__loading">Loading…</div>

    <template v-else>
      <!-- LOGO SECTION -->
      <div class="profile-card">
        <h3>Logo</h3>

        <div class="logo-section">
          <div class="logo-preview">
            <img v-if="logoUrl" :src="logoUrl" alt="Company logo" class="logo-img" />
            <div v-else class="logo-placeholder">🏢</div>
          </div>

          <div class="logo-actions">
            <label class="btn btn--outline" style="cursor:pointer">
              📎 Upload Logo
              <input type="file" accept="image/jpg,image/jpeg,image/png" @change="handleLogo" style="display:none" />
            </label>
            <button v-if="logoUrl" class="btn btn--danger" @click="deleteLogo">🗑 Delete Logo</button>
          </div>
        </div>
      </div>

      <!-- INFO FORM -->
      <div class="profile-card">
        <h3>Company Info</h3>

        <div class="form-group">
          <label>Name *</label>
          <input v-model="form.name" placeholder="Company name" />
        </div>

        <div class="form-group">
          <label>Location *</label>
          <input v-model="form.location" placeholder="e.g. Sétif, Algeria" />
        </div>

        <div class="form-group">
          <label>Description *</label>
          <textarea v-model="form.description" rows="5" placeholder="Describe your company…" />
        </div>

        <p v-if="error"   class="form__msg form__msg--error">{{ error }}</p>
        <p v-if="success" class="form__msg">{{ success }}</p>

        <button class="btn btn--primary" @click="save" :disabled="saving">
          {{ saving ? "Saving…" : "Save Profile" }}
        </button>
      </div>
    </template>

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import companyApi         from "../../services/companyApi";
import Toast              from "../components/Toast.vue";

const form    = ref({ name: "", description: "", location: "" });
const logoUrl = ref(null);
const logoFile = ref(null);
const loading  = ref(true);
const saving   = ref(false);
const error    = ref("");
const success  = ref("");
const toast    = ref(null);

const load = async () => {
  loading.value = true;
  try {
    const res = await companyApi.profile();
    const d   = res.data.data;
    form.value.name        = d.name        ?? "";
    form.value.description = d.description ?? "";
    form.value.location    = d.location    ?? "";
    logoUrl.value          = d.logo_url    ?? null;
  } catch {
    toast.value?.notify("Failed to load profile", "error");
  } finally {
    loading.value = false;
  }
};

const handleLogo = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  logoFile.value = file;
  logoUrl.value  = URL.createObjectURL(file);
};

const deleteLogo = async () => {
  try {
    await companyApi.deleteLogo();
    logoUrl.value  = null;
    logoFile.value = null;
    toast.value?.notify("Logo deleted");
  } catch (e) {
    toast.value?.notify(e.response?.data?.message || "Error deleting logo", "error");
  }
};

const save = async () => {
  error.value   = "";
  success.value = "";

  if (!form.value.name || !form.value.description || !form.value.location) {
    error.value = "Name, description and location are required.";
    return;
  }

  saving.value = true;
  try {
    const fd = new FormData();
    fd.append("name",        form.value.name);
    fd.append("description", form.value.description);
    fd.append("location",    form.value.location);
    if (logoFile.value) fd.append("logo", logoFile.value);

    const res = await companyApi.updateProfile(fd);
    logoUrl.value  = res.data.data?.logo_url ?? logoUrl.value;
    logoFile.value = null;
    success.value  = "Profile saved ✓";
    toast.value?.notify("Profile updated ✓");
  } catch (e) {
    const errs = e.response?.data?.errors;
    if (errs) {
      error.value = Object.values(errs).flat().join(" | ");
    } else {
      error.value = e.response?.data?.message || "Failed to save profile.";
    }
  } finally {
    saving.value = false;
  }
};

onMounted(load);
</script>

<style scoped>
.profile-card { background:var(--bg2); border:1px solid var(--border); border-radius:14px; padding:24px; display:flex; flex-direction:column; gap:16px; }
.profile-card h3 { font-size:16px; margin-bottom:4px; }
.logo-section { display:flex; align-items:center; gap:20px; }
.logo-preview { width:96px; height:96px; border-radius:12px; overflow:hidden; background:var(--bg3); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; }
.logo-img { width:100%; height:100%; object-fit:cover; }
.logo-placeholder { font-size:40px; }
.logo-actions { display:flex; flex-direction:column; gap:8px; }
</style>