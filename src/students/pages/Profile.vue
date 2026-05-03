<template>
  <div class="page">
    <h1>My Profile 👤</h1>

    <div v-if="loading" class="page__loading">Loading profile...</div>

    <template v-else>
      <!-- COMPLETION -->
      <div class="card">
        <ProfileCompletion :value="completion" />
        <div v-if="missing.length" class="profile__missing">
          <p>⚠ Missing fields:</p>
          <div class="profile__missing-chips">
            <span v-for="m in missing" :key="m" class="chip chip--warn">{{ m }}</span>
          </div>
        </div>
      </div>

      <!-- PROFILE FORM -->
      <div class="card">
        <h3>Profile Info</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>University</label>
            <input v-model="form.university" placeholder="University name" />
          </div>
          <div class="form-group">
            <label>Wilaya</label>
            <input v-model="form.wilaya" placeholder="Wilaya" />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input v-model="form.phone" placeholder="+213..." />
          </div>
          <div class="form-group">
            <label>GitHub</label>
            <input v-model="form.github_link" placeholder="https://github.com/..." />
          </div>
          <div class="form-group">
            <label>LinkedIn</label>
            <input v-model="form.linkedin" placeholder="https://linkedin.com/in/..." />
          </div>
          <div class="form-group">
            <label>Portfolio</label>
            <input v-model="form.portfolio" placeholder="https://..." />
          </div>
        </div>

        <div class="form-group">
          <label>Bio</label>
          <textarea v-model="form.bio" placeholder="Brief description about you..." rows="3" />
        </div>

        <!-- NOTE: education / experience / projects removed here — they live inside CvManager now -->

        <button class="btn btn--primary" @click="save" :disabled="saving">
          {{ saving ? "Saving..." : "Save Profile" }}
        </button>
        <p v-if="saveMsg" class="form__msg">{{ saveMsg }}</p>
      </div>

      <!-- DIGITAL CV -->
      <div class="card">
        <CvManager @updated="load" />
      </div>

      <!-- SKILLS -->
      <div class="card">
        <SkillsManager :skills="skills" @updated="load" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import studentApi from "../../services/studentApi";
import ProfileCompletion from "../components/ProfileCompletion.vue";
import CvManager from "../components/CvManager.vue";
import SkillsManager from "../components/SkillsManager.vue";

const form       = ref({});
const completion = ref(0);
const missing    = ref([]);
const skills     = ref([]);
const loading    = ref(true);
const saving     = ref(false);
const saveMsg    = ref("");

const load = async () => {
  loading.value = true;
  try {
    const res  = await studentApi.profile();
    const d    = res.data.data;
    const s    = d.user?.student || {};

    // profile-only fields — CV fields are owned by CvManager
    form.value = {
      university:  s.university  || "",
      wilaya:      s.wilaya      || "",
      phone:       s.phone       || "",
      github_link: s.github_link || "",
      linkedin:    s.linkedin    || "",
      portfolio:   s.portfolio   || "",
      bio:         s.bio         || "",
    };

    completion.value = d.completion;
    missing.value    = d.missing || [];
    skills.value     = s.skills  || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  saving.value  = true;
  saveMsg.value = "";
  try {
    const fd = new FormData();
    const fields = ["university","wilaya","github_link","bio","phone","linkedin","portfolio"];
    fields.forEach((k) => { if (form.value[k] != null) fd.append(k, form.value[k]); });

    await studentApi.updateProfile(fd);
    saveMsg.value = "Profile saved ✓";
    load();
  } catch (e) {
    saveMsg.value = e.response?.data?.message || "Save failed";
  } finally {
    saving.value = false;
  }
};

onMounted(load);
</script>