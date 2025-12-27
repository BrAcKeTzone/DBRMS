import { fetchClient } from "../utils/fetchClient";

export const settingsApi = {
  // Penalty settings
  getPenaltySettings: async () => {
    return await fetchClient.get("/settings/category/penalty");
  },

  updatePenaltySettings: async (penaltyData) => {
    return await fetchClient.put("/settings", penaltyData);
  },

  // Payment basis settings
  getPaymentBasisSettings: async () => {
    return await fetchClient.get("/settings/category/payment");
  },

  updatePaymentBasisSettings: async (paymentData) => {
    return await fetchClient.put("/settings", paymentData);
  },

  // Contribution amount settings
  getContributionSettings: async () => {
    return await fetchClient.get("/settings/category/contribution");
  },

  updateContributionSettings: async (contributionData) => {
    return await fetchClient.put("/settings", contributionData);
  },

  // Document category settings
  getDocumentCategories: async () => {
    return await fetchClient.get("/settings/documents/categories");
  },

  updateDocumentCategories: async (categories) => {
    return await fetchClient.put("/settings", categories);
  },

  addDocumentCategory: async (categoryData) => {
    return await fetchClient.post(
      "/settings/documents/categories",
      categoryData
    );
  },

  deleteDocumentCategory: async (categoryId) => {
    return await fetchClient.delete(
      `/settings/documents/categories/${categoryId}`
    );
  },

  // System settings
  getSystemSettings: async () => {
    return await fetchClient.get("/settings/category/system");
  },

  updateSystemSettings: async (systemData) => {
    return await fetchClient.put("/settings", systemData);
  },

  // School year settings
  getSchoolYearSettings: async () => {
    return await fetchClient.get("/settings/category/academic");
  },

  updateSchoolYearSettings: async (schoolYearData) => {
    return await fetchClient.put("/settings", schoolYearData);
  },

  // Notification settings
  getNotificationSettings: async () => {
    return await fetchClient.get("/settings/category/notification");
  },

  updateNotificationSettings: async (notificationData) => {
    return await fetchClient.put("/settings", notificationData);
  },

  // All settings (for settings page)
  getAllSettings: async () => {
    return await fetchClient.get("/settings");
  },

  // Backup settings
  backupSettings: async () => {
    return await fetchClient.post(
      "/settings/backup",
      {},
      {
        responseType: "blob",
      }
    );
  },

  restoreSettings: async (backupFile) => {
    const formData = new FormData();
    formData.append("backup", backupFile);

    return await fetchClient.post("/settings/restore", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Reset to defaults
  resetToDefaults: async (settingType = "all") => {
    return await fetchClient.post("/settings/reset", { settingType });
  },
};
