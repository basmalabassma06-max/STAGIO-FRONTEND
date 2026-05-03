<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Welcome Back 👋</h1>
      <p class="subtitle">Login to your account</p>

      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="Enter your email" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="form.password" type="password" placeholder="Enter your password" />
      </div>

      <button class="btn" @click="login" :disabled="loading">
        {{ loading ? "Logging in..." : "Login" }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>

      <p class="switch">
        Don't have an account?
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../../services/api";

const router = useRouter();

const form = ref({
  email: "",
  password: ""
});

const loading = ref(false);
const error = ref("");

const login = async () => {
  error.value = "";

  if (!form.value.email || !form.value.password) {
    error.value = "All fields are required";
    return;
  }

  loading.value = true;

  try {
    const res = await api.post("/login", form.value);

    const user = res.data.user;
    const role = user.role?.toLowerCase();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(user));

    if (role === "company") {
      router.push("/company");
    } else {
      router.push("/student");
    }

  } catch (e) {
    const code = e.response?.data?.error || e.response?.data?.message || "";

    if (code === "pending" || code.toLowerCase().includes("pending")) {
      error.value = "Your account is under review.";
    } else if (code === "rejected" || code.toLowerCase().includes("rejected")) {
      error.value = "Your registration was rejected.";
    } else {
      error.value = code || "Invalid credentials";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
}
.auth-card {
  background: #1e293b;
  padding: 30px;
  border-radius: 16px;
  width: 320px;
  color: white;
}
.subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 15px;
}
input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  margin-top: 5px;
}
.btn {
  width: 100%;
  padding: 10px;
  background: #6366f1;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}
.error {
  margin-top: 10px;
  color: #ef4444;
}
.switch {
  margin-top: 15px;
  font-size: 13px;
}
</style>