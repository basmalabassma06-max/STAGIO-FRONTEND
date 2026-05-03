import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,

  (err) => {
    if (err.response?.status === 401) {
      const user = JSON.parse(localStorage.getItem("user"));

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (user?.role === "admin") {
        window.location.href = "/admin/login";
      } else {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
  
);

export default api;