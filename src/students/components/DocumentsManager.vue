<template>
  <div class="docs-manager">
    <h3>Documents</h3>

    <div class="docs-manager__generate">
      <button class="btn btn--outline" @click="generate">📄 Generate Convention</button>
      <button class="btn btn--outline" @click="certificate">🎓 Generate Certificate</button>
    </div>

    <div class="docs-manager__download">
      <input v-model="docId" placeholder="Document ID" class="input" />
      <button class="btn btn--primary" @click="download" :disabled="!docId">Download</button>
    </div>

    <p v-if="message" class="docs-manager__msg">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import studentApi from "../services/studentApi";

const props = defineProps(["internshipId"]);
const docId = ref("");
const message = ref("");

const generate = async () => {
  try {
    const res = await studentApi.generateDocument(props.internshipId);
    docId.value = res.data.data?.id || "";
    message.value = "Convention generated ✓";
  } catch (e) {
    message.value = e.response?.data?.message || "Error generating document";
  }
};

const certificate = async () => {
  try {
    const res = await studentApi.generateCertificate(props.internshipId);
    docId.value = res.data.data?.id || "";
    message.value = "Certificate generated ✓";
  } catch (e) {
    message.value = e.response?.data?.message || "Error generating certificate";
  }
};

const download = async () => {
  try {
    const res = await studentApi.downloadDocument(docId.value);
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `document-${docId.value}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    message.value = "Download failed";
  }
};
</script>