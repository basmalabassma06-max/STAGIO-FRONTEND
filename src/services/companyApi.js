// src/services/companyApi.js

import api from "./api";

const companyApi = {
  /* =========================
   * PROFILE
   * ========================= */
  profile() {
    return api.get("/company/profile");
  },

  updateProfile(formData) {
    return api.post("/company/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteLogo() {
    return api.delete("/company/logo");
  },

  /* =========================
   * APPLICATIONS
   * ========================= */
  applications(params = {}) {
    return api.get("/company/applications", {
      params,
    });
  },

  showApplication(id) {
    return api.get(`/company/applications/${id}`);
  },

  acceptApplication(id) {
    return api.post(
      `/company/applications/${id}/accept`
    );
  },

  rejectApplication(id) {
    return api.post(
      `/company/applications/${id}/reject`
    );
  },

  downloadStudentCv(id) {
    return api.get(
      `/company/applications/${id}/cv`,
      {
        responseType: "blob",
      }
    );
  },

  /* =========================
   * STATS
   * ========================= */
  stats() {
    return api.get("/company/stats");
  },

  /* =========================
   * NOTIFICATIONS
   * ========================= */
  notifications(page = 1) {
    return api.get(
      "/company/notifications",
      {
        params: { page },
      }
    );
  },

  markAsRead(id) {
    return api.post(
      `/company/notifications/${id}/read`
    );
  },

  /* =========================
   * OFFERS
   * ========================= */
  myOffers(params = {}) {
    return api.get("/company/offers", {
      params,
    });
  },

  getOffer(id) {
    return api.get(`/company/offers/${id}`);
  },

  createOffer(data) {
    return api.post(
      "/company/offers",
      data
    );
  },

  updateOffer(id, data) {
    return api.put(
      `/company/offers/${id}`,
      data
    );
  },

  deleteOffer(id) {
    return api.delete(
      `/company/offers/${id}`
    );
  },

  toggleOffer(id) {
    return api.post(
      `/company/offers/${id}/toggle`
    );
  },
};

export default companyApi;