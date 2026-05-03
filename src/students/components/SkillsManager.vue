<template>
  <div class="skills-manager">
    <h3>Skills</h3>
    <div class="skills-manager__input">
      <input v-model="newSkill" placeholder="Add a skill..." @keyup.enter="add" />
      <button class="btn btn--primary" @click="add" :disabled="!newSkill.trim() || loading">
        Add
      </button>
    </div>
    <div class="skills-manager__list">
      <span v-for="s in skills" :key="s.id" class="chip chip--removable">
        {{ s.name }}
        <button @click="remove(s.id)">×</button>
      </span>
      <span v-if="!skills?.length" class="skills-manager__empty">No skills added yet</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import studentApi from "../../services/studentApi";

const props = defineProps(["skills"]);
const emit = defineEmits(["updated"]);

const newSkill = ref("");
const loading = ref(false);

const add = async () => {
  if (!newSkill.value.trim()) return;
  loading.value = true;
  try {
    await studentApi.addSkills([newSkill.value.trim()]);
    newSkill.value = "";
    emit("updated");
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const remove = async (id) => {
  try {
    await studentApi.removeSkill(id);
    emit("updated");
  } catch (e) {
    console.error(e);
  }
};
</script>