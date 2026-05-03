<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-card__logo">🛡 Admin Panel</div>
      <h2>Administrator Login</h2>
      <p class="auth-card__sub">Restricted access — admins only</p>

      <div v-if="error" class="auth-card__error">{{ error }}</div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="admin@example.com" />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input v-model="form.password" type="password" placeholder="••••••••" @keyup.enter="login" />
      </div>

      <button class="btn btn--primary btn--full" @click="login" :disabled="loading">
        {{ loading ? "Signing in…" : "Sign In" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref }         from "vue";
import { useRouter }   from "vue-router";
import adminApi        from "../../services/adminApi";

const router  = useRouter();
const form    = ref({ email: "", password: "" });
const loading = ref(false);
const error   = ref("");

const login = async () => {
  error.value = "";
  loading.value = true;

  try {
    const res = await adminApi.login(form.value);

    localStorage.setItem("token", res.data.data.token);

    localStorage.setItem(
      "user",
      JSON.stringify({
        role: "admin",
        name: "Administrator"
      })
    );

    router.push("/admin");

  } catch (e) {
    error.value = e.response?.data?.message || "Invalid credentials";
  } finally {
    loading.value = false;
  }
};
</script>