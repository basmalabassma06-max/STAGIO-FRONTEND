<template>
  <div class="page">
    <button class="btn btn--ghost" @click="$router.back()">← Back</button>

    <div v-if="loading" class="page__loading">Loading…</div>

    <template v-else-if="item">
      <div class="detail-card">
        <!-- HEADER -->
        <div class="detail-card__header">
          <div>
            <h1>{{ item.offer?.title || "Internship #" + item.id }}</h1>
            <p class="text-muted">Created {{ fmtDate(item.created_at) }}</p>
          </div>

          <StatusBadge :status="item.status" />
        </div>

        <!-- INFO -->
        <div class="info-columns">
          <!-- STUDENT -->
          <div class="info-box">
            <h3>👤 Student</h3>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name</span>
                <span>{{ item.student?.user?.name || item.student?.name || "—" }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Email</span>
                <span>{{ item.student?.user?.email || item.student?.email || "—" }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">University</span>
                <span>{{ item.student?.university || "—" }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Wilaya</span>
                <span>{{ item.student?.wilaya || "—" }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Phone</span>
                <span>{{ item.student?.phone || "—" }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">GitHub</span>

                <a
                  v-if="item.student?.github_link"
                  :href="item.student.github_link"
                  target="_blank"
                >
                  Link ↗
                </a>

                <span v-else>—</span>
              </div>
            </div>

            <!-- ACTIONS -->
            <div class="info-box__actions">
              <button
                class="btn btn--outline btn--sm"
                @click="downloadCv"
              >
                ⬇ Download CV
              </button>
            </div>

            <div
              class="info-box__actions"
              v-if="item.student?.user_id"
            >
              <button
                :class="[
                  'btn btn--sm',
                  item.student?.user?.is_active === false
                    ? 'btn--success'
                    : 'btn--warning'
                ]"
                @click="toggleUser(item.student.user_id, 'student')"
              >
                {{
                  item.student?.user?.is_active === false
                    ? "Enable Account"
                    : "Disable Account"
                }}
              </button>

              <button
                class="btn btn--sm btn--danger"
                @click="openDeleteUser(item.student.user_id, item.student?.user?.name)"
              >
                🗑 Delete User
              </button>
            </div>
          </div>

          <!-- COMPANY -->
          <div class="info-box">
            <h3>🏢 Company</h3>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name</span>
                <span>{{ item.company?.name || "—" }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Location</span>
                <span>{{ item.company?.location || "—" }}</span>
              </div>

              <div class="info-item full">
                <span class="info-label">Description</span>
                <span>{{ item.company?.description || "—" }}</span>
              </div>
            </div>
          </div>

          <!-- OFFER -->
          <div class="info-box">
            <h3>📄 Offer</h3>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Title</span>
                <span>{{ item.offer?.title || "—" }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Type</span>
                <span>{{ item.offer?.type || "—" }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Location</span>
                <span>{{ item.offer?.location || "—" }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Deadline</span>
                <span>{{ fmtDate(item.offer?.deadline) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- STATUS INFO -->
        <div
          v-if="item.validated_at"
          class="info-box"
        >
          <h3>✅ Validation</h3>
          <p class="text-muted text-sm">
            Validated on {{ fmtDate(item.validated_at) }}
          </p>
        </div>

        <div
          v-if="item.rejected_at"
          class="info-box"
        >
          <h3>❌ Rejection</h3>
          <p class="text-muted text-sm">
            Rejected on {{ fmtDate(item.rejected_at) }}
          </p>
        </div>

        <!-- ACTION BUTTONS -->
        <div
          v-if="item.status === 'pending_admin'"
          class="detail-card__actions"
        >
          <button
            class="btn btn--success"
            @click="openValidate"
            :disabled="actLoading"
          >
            ✓ Validate
          </button>

          <button
            class="btn btn--danger"
            @click="openReject"
            :disabled="actLoading"
          >
            ✗ Reject
          </button>
        </div>

        <p
          v-if="actionMsg"
          :class="[
            'form__msg',
            actionMsgType === 'error'
              ? 'form__msg--error'
              : ''
          ]"
        >
          {{ actionMsg }}
        </p>
      </div>
    </template>

    <!-- VALIDATE -->
    <ConfirmModal
      :show="valModal"
      title="Validate Internship"
      message="Validate this internship?"
      label="Validate"
      @confirm="doValidate"
      @cancel="valModal = false"
    />

    <!-- REJECT -->
    <ConfirmModal
      :show="rejModal"
      title="Reject Internship"
      message="Reject this internship?"
      label="Reject"
      :danger="true"
      :withReason="true"
      @confirm="doReject"
      @cancel="rejModal = false"
    />

    <!-- DELETE -->
    <ConfirmModal
      :show="delUserModal.show"
      title="Delete User"
      :message="`Delete ${delUserModal.name}?`"
      label="Delete"
      :danger="true"
      @confirm="doDeleteUser"
      @cancel="delUserModal.show = false"
    />

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

import adminApi from "../../services/adminApi";
import StatusBadge from "../components/StatusBadge.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import Toast from "../components/Toast.vue";

const route = useRoute();

const item = ref(null);
const loading = ref(true);
const actLoading = ref(false);

const actionMsg = ref("");
const actionMsgType = ref("success");

const toast = ref(null);

const valModal = ref(false);
const rejModal = ref(false);

const delUserModal = ref({
  show: false,
  id: null,
  name: ""
});

const load = async () => {
  loading.value = true;

  try {
    const res = await adminApi.showInternship(route.params.id);
    item.value = res.data.data;
  } catch {
    toast.value?.notify("Failed to load", "error");
  } finally {
    loading.value = false;
  }
};

const openValidate = () => {
  valModal.value = true;
};

const openReject = () => {
  rejModal.value = true;
};

const doValidate = async () => {
  valModal.value = false;
  actLoading.value = true;

  try {
    await adminApi.validateInternship(route.params.id);

    actionMsg.value =
      "✓ Internship validated";

    actionMsgType.value = "success";

    await load();
  } catch (e) {
    actionMsg.value =
      e.response?.data?.message ||
      "Validation failed";

    actionMsgType.value = "error";
  } finally {
    actLoading.value = false;
  }
};

const doReject = async (reason) => {
  rejModal.value = false;
  actLoading.value = true;

  try {
    await adminApi.rejectInternship(
      route.params.id,
      reason
    );

    actionMsg.value =
      "Internship rejected";

    actionMsgType.value = "success";

    await load();
  } catch (e) {
    actionMsg.value =
      e.response?.data?.message ||
      "Reject failed";

    actionMsgType.value = "error";
  } finally {
    actLoading.value = false;
  }
};

const toggleUser = async (userId, type) => {
  try {
    await adminApi.toggleUser(userId);

    toast.value?.notify(
      `${type} account updated`
    );

    await load();
  } catch (e) {
    toast.value?.notify(
      e.response?.data?.message || "Error",
      "error"
    );
  }
};

const openDeleteUser = (id, name) => {
  delUserModal.value = {
    show: true,
    id,
    name: name || "this user"
  };
};

const doDeleteUser = async () => {
  delUserModal.value.show = false;

  try {
    await adminApi.deleteUser(
      delUserModal.value.id
    );

    toast.value?.notify("User deleted");

    await load();
  } catch (e) {
    toast.value?.notify(
      e.response?.data?.message || "Error",
      "error"
    );
  }
};

const downloadCv = async () => {
  try {
    const res = await adminApi.downloadCv(
      route.params.id
    );

    const blob = new Blob([res.data], {
      type: "application/pdf"
    });

    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = "Student_CV.pdf";
    a.click();

    window.URL.revokeObjectURL(url);
  } catch {
    toast.value?.notify(
      "Failed to download CV",
      "error"
    );
  }
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString()
    : "—";

onMounted(load);
</script>

<style scoped>
.detail-card{
  background:var(--bg2);
  border:1px solid var(--border);
  border-radius:14px;
  padding:28px;
  display:flex;
  flex-direction:column;
  gap:24px;
}

.detail-card__header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
}

.detail-card__actions{
  display:flex;
  gap:10px;
}

.info-columns{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:16px;
}

.info-box{
  background:var(--bg3);
  border:1px solid var(--border);
  border-radius:10px;
  padding:16px;
  display:flex;
  flex-direction:column;
  gap:12px;
}

.info-box h3{
  font-size:14px;
  color:var(--muted);
}

.info-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

.info-item{
  display:flex;
  flex-direction:column;
  gap:4px;
}

.full{
  grid-column:1/-1;
}

.info-label{
  font-size:11px;
  color:var(--muted);
  text-transform:uppercase;
}

.info-box__actions{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

.form__msg{
  color:var(--success);
}

.form__msg--error{
  color:var(--danger);
}
</style>