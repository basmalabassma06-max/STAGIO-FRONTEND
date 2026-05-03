<template>
  <div class="page">
    <div class="page__header">
      <h1>Documents 📁</h1>
      <button class="btn btn--ghost btn--sm" @click="load">↺ Refresh</button>
    </div>

    <div v-if="loading" class="page__loading">Loading files…</div>

    <template v-else>
      <div v-if="files.length === 0" class="empty">No documents found</div>

      <div v-else class="files-grid">
        <div v-for="file in files" :key="file" class="file-card">
          <div class="file-card__icon">
            {{ file.startsWith("convention") ? "📄" : "🎓" }}
          </div>
          <div class="file-card__info">
            <p class="file-card__name">{{ file }}</p>
            <p class="file-card__type text-muted text-sm">
              {{ file.startsWith("convention") ? "Convention" : "Certificate" }}
              · ID {{ extractId(file) }}
            </p>
          </div>
          <div class="file-card__actions">
            <button class="btn btn--sm btn--outline" @click="download(file)">⬇ Download</button>
            <button class="btn btn--sm btn--danger"  @click="confirmDelete(file)">🗑 Delete</button>
          </div>
        </div>
      </div>
    </template>

    <ConfirmModal
      :show="delModal.show"
      title="Delete File"
      :message="`Permanently delete ${delModal.file}?`"
      label="Delete"
      :danger="true"
      @confirm="doDelete"
      @cancel="delModal.show = false"
    />

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import adminApi    from "../../services/adminApi";
import ConfirmModal from "../components/ConfirmModal.vue";
import Toast        from "../components/Toast.vue";

const files   = ref([]);
const loading = ref(false);
const toast   = ref(null);
const delModal = ref({ show: false, file: "" });

const load = async () => {
  loading.value = true;
  try {
    const res = await adminApi.listFiles();
    files.value = res.data.data;
  } catch { toast.value?.notify("Failed to load files", "error"); }
  finally  { loading.value = false; }
};

const download = async (file) => {
  try {
    const res = await adminApi.downloadFile(file);
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const a   = Object.assign(document.createElement("a"), { href: url, download: file });
    a.click(); URL.revokeObjectURL(url);
  } catch { toast.value?.notify("Download failed", "error"); }
};

const confirmDelete = (file) => { delModal.value = { show: true, file }; };

const doDelete = async () => {
  delModal.value.show = false;
  try {
    await adminApi.deleteFile(delModal.value.file);
    toast.value?.notify("File deleted");
    load();
  } catch (e) {
    toast.value?.notify(e.response?.data?.message || "Error", "error");
  }
};

const extractId = (file) => file.replace(/^(convention|certificate)_/, "").replace(".pdf", "");

onMounted(load);
</script>

<style scoped>
.files-grid { display:flex; flex-direction:column; gap:10px; }
.file-card { background:var(--bg2); border:1px solid var(--border); border-radius:12px; padding:16px 20px; display:flex; align-items:center; gap:16px; }
.file-card__icon { font-size:28px; }
.file-card__info { flex:1; }
.file-card__name { font-size:14px; font-weight:600; word-break:break-all; }
.file-card__actions { display:flex; gap:8px; }
</style>