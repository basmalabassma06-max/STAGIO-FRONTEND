import api from "./api";

export default {
  // Auth
  login:  (data) => api.post("/admin/login", data),
  logout: ()     => api.post("/admin/logout"),

  // Dashboard
  dashboard: () => api.get("/admin/dashboard"),

  // Internships
  internships:        (params = {}) => api.get("/admin/internships", { params }),
  showInternship:     (id)          => api.get(`/admin/internships/${id}`),
  validateInternship: (id)          => api.post(`/admin/internships/${id}/validate`),
  rejectInternship:   (id, reason)  => api.post(`/admin/internships/${id}/reject`, { reason }),

  // Users
  toggleUser: (id) => api.post(`/admin/users/${id}/toggle`),
  deleteUser:  (id) => api.delete(`/admin/users/${id}`),

  // Notifications
  notifications:        (page = 1) => api.get("/admin/notifications", { params: { page } }),
  markNotification:     (id)       => api.post(`/admin/notifications/${id}/read`),
  markAllNotifications: ()         => api.post("/admin/notifications/read-all"),

  // Files
  listFiles:    ()     => api.get("/admin/files"),
  downloadFile: (file) => api.get(`/admin/files/${file}`, { responseType: "blob" }),
  deleteFile:   (file) => api.delete(`/admin/files/${file}`),

  // Export
  exportStats:       () => api.get("/admin/export/stats",       { responseType: "blob" }),
  exportInternships: () => api.get("/admin/export/internships", { responseType: "blob" }),

  // CV
  downloadCv: (id) => api.get(`/admin/internships/${id}/cv`, { responseType: "blob" }),

  // Logs
  getLogs: (params = {}) => api.get("/admin/logs", { params }),

  // ─── Company Approval ─────────────────────────────────────────────────────
  pendingCompanies:  (params = {}) => api.get("/admin/companies/pending", { params }),
  approveCompany:    (id)          => api.post(`/admin/companies/${id}/approve`),
  rejectCompany:     (id, reason)  => api.post(`/admin/companies/${id}/reject`, { reason }),
  downloadAgreement: (id)          => api.get(`/admin/companies/${id}/agreement`, { responseType: "blob" }),
};