<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Create Account 🚀</h1>
      <p class="subtitle">Join us today</p>

      <div class="form-group">
        <label>Name</label>
        <input v-model="form.name" placeholder="Full name" />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="Email" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="form.password" type="password" placeholder="Password" />
      </div>

      <div class="form-group">
        <label>Confirm Password</label>
        <input v-model="form.password_confirmation" type="password" placeholder="Confirm password" />
      </div>

      <div class="form-group">
        <label>Role</label>
        <select v-model="form.role">
          <option value="student">Student</option>
          <option value="company">Company</option>
        </select>
      </div>

      <!--
        FIX #4: Accept only PDF files to match backend validation (mimes:pdf).
        Original had .doc/.docx which the backend rejects.
      -->
      <div v-if="form.role === 'company'" class="form-group">
        <label>Agreement File (PDF only)</label>
        <input type="file" @change="onFileChange" accept=".pdf" />
      </div>

      <button class="btn" @click="register" :disabled="loading">
        {{ loading ? "Creating..." : "Register" }}
      </button>

      <!-- FIX #10: Show pending message as success info, not on redirect -->
      <p v-if="pending" class="info">
        ✅ Registration received. Please check your email to verify your account.
        Your company account will be reviewed by an admin before you can log in.
      </p>

      <!-- Student success message -->
      <p v-if="success" class="info">
        ✅ Registered successfully. Please check your email to verify your account.
      </p>

      <p v-if="error" class="error">{{ error }}</p>

      <p class="switch">
        Already have an account?
        <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../../services/api";

// FIX #10: Removed useRouter — registration never redirects automatically.
// The user must verify their email and then log in manually.

const form = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "student"
});

const agreementFile = ref(null);
const loading = ref(false);
const error = ref("");
const pending = ref(false);
const success = ref(false);

const onFileChange = (e) => {
  agreementFile.value = e.target.files[0] || null;
};

const register = async () => {
  error.value = "";
  pending.value = false;
  success.value = false;

  if (
    !form.value.name ||
    !form.value.email ||
    !form.value.password ||
    !form.value.password_confirmation
  ) {
    error.value = "All fields are required";
    return;
  }

  if (form.value.password !== form.value.password_confirmation) {
    error.value = "Passwords do not match";
    return;
  }

  // FIX #9: Validate agreement file presence on the frontend before submitting
  if (form.value.role === "company" && !agreementFile.value) {
    error.value = "Agreement file (PDF) is required for company registration";
    return;
  }

  loading.value = true;

  try {
    if (form.value.role === "company") {
      const fd = new FormData();
      fd.append("name", form.value.name);
      fd.append("email", form.value.email);
      fd.append("password", form.value.password);
      fd.append("password_confirmation", form.value.password_confirmation);
      fd.append("role", form.value.role);
      fd.append("agreement_file", agreementFile.value);

      await api.post("/register", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Company always lands in pending state after registration
      pending.value = true;
    } else {
      await api.post("/register", form.value);

      // Student must verify email before logging in — show success, no redirect
      // FIX #10: No token is returned on registration; never store or redirect
      success.value = true;
    }
  } catch (e) {
    const msg =
      e.response?.data?.message ||
      JSON.stringify(e.response?.data?.errors) ||
      "Registration failed";

    error.value = msg;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a, #020617);
  padding: 20px;
}

.auth-card {
  background: #1e293b;
  padding: 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
  color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  animation: fadeIn 0.4s ease;
}

h1 {
  font-size: 22px;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 12px;
}

label {
  font-size: 13px;
  color: #cbd5f5;
}

input,
select {
  width: 100%;
  padding: 9px;
  border-radius: 8px;
  border: none;
  margin-top: 5px;
  font-size: 14px;
  outline: none;
}

input:focus,
select:focus {
  box-shadow: 0 0 0 2px #22c55e;
}

.btn {
  width: 100%;
  padding: 10px;
  background: #22c55e;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}

.btn:hover {
  background: #16a34a;
}

.error {
  margin-top: 10px;
  color: #ef4444;
  font-size: 13px;
}

.info {
  margin-top: 10px;
  color: #f59e0b;
  font-size: 13px;
  line-height: 1.5;
}

.switch {
  margin-top: 15px;
  font-size: 13px;
  text-align: center;
}

.switch a {
  color: #22c55e;
  text-decoration: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>