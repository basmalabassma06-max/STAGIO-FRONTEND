import api from "./api";

export default {
  /* Dashboard */
  dashboard() { return api.get("/student/dashboard"); },

  /* Profile */
  profile() { return api.get("/student/profile"); },
  updateProfile(formData) {
    return api.post("/student/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /* Digital CV — clear only */
  clearDigitalCv() { return api.delete("/student/cv"); },
  downloadCvPdf() {
  return api.get("/student/cv/download", {
    responseType: "blob"
  });
},
  /* Skills */
  addSkills(skills = []) { return api.post("/student/skills", { skills }); },
  removeSkill(id)        { return api.delete(`/student/skills/${id}`); },

  /* Offers */
  offers(page = 1, filters = {}) {
    return api.get("/offers", { params: { page, per_page: 9, ...filters } });
  },
  offerDetails(id) { return api.get(`/offers/${id}`); },
  recommended(page = 1) {
    return api.get("/student/recommended-offers", { params: { page } });
  },

  /* Save / Unsave */
  saveOffer(id)   { return api.post(`/offers/${id}/save`); },
  unsaveOffer(id) { return api.delete(`/offers/${id}/save`); },
  savedOffers(page = 1) {
    return api.get("/student/saved-offers", { params: { page } });
  },

  /* Apply */
  apply(id, motivation = "") { return api.post(`/apply/${id}`, { motivation }); },

  /* Applications */
  myApplications(page = 1) {
    return api.get("/applications", { params: { page } });
  },
  showApplication(id)         { return api.get(`/applications/${id}`); },
  updateApplication(id, data) { return api.put(`/applications/${id}`, data); },
  withdraw(id)                { return api.delete(`/applications/${id}`); },

  /* Notifications */
  notifications(page = 1) {
    return api.get("/notifications", { params: { page } });
  },
  markAsRead(id)  { return api.post(`/notifications/${id}/read`); },
  markAllAsRead() { return api.post("/notifications/read-all"); },
  unreadCount()   { return api.get("/notifications/unread-count"); },

  /* Documents */
  generateDocument(id)    { return api.post(`/internships/${id}/document`); },
  generateCertificate(id) { return api.post(`/internships/${id}/certificate`); },
  downloadDocument(id) {
    return api.get(`/documents/${id}/download`, { responseType: "blob" });
  },

  /* Stats */
  stats() { return api.get("/student/stats"); },
};