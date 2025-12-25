import { fetchClient } from "../utils/fetchClient";
import config from "../config";
import { dummyDataService } from "../services/dummyDataService";

export const settingsApi = {
  // Penalty settings
  getPenaltySettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getPenaltySettings();
    }
    return await fetchClient.get("/settings/category/penalty");
  },

  updatePenaltySettings: async (penaltyData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updatePenaltySettings(penaltyData);
    }
    return await fetchClient.put("/settings", penaltyData);
  },

  // Payment basis settings
  getPaymentBasisSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getPaymentBasisSettings();
    }
    return await fetchClient.get("/settings/category/payment");
  },

  updatePaymentBasisSettings: async (paymentData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updatePaymentBasisSettings(paymentData);
    }
    return await fetchClient.put("/settings", paymentData);
  },

  // Contribution amount settings
  getContributionSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getContributionSettings();
    }
    return await fetchClient.get("/settings/category/contribution");
  },

  updateContributionSettings: async (contributionData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateContributionSettings(
        contributionData
      );
    }
    return await fetchClient.put("/settings", contributionData);
  },

  // Document category settings
  getDocumentCategories: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getDocumentCategories();
    }
    return await fetchClient.get("/settings/documents/categories");
  },

  updateDocumentCategories: async (categories) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateDocumentCategories(categories);
    }
    return await fetchClient.put("/settings", categories);
  },

  addDocumentCategory: async (categoryData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.addDocumentCategory(categoryData);
    }
    return await fetchClient.post(
      "/settings/documents/categories",
      categoryData
    );
  },

  deleteDocumentCategory: async (categoryId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteDocumentCategory(categoryId);
    }
    return await fetchClient.delete(
      `/settings/documents/categories/${categoryId}`
    );
  },

  // System settings
  getSystemSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getSystemSettings();
    }
    return await fetchClient.get("/settings/category/system");
  },

  updateSystemSettings: async (systemData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateSystemSettings(systemData);
    }
    return await fetchClient.put("/settings", systemData);
  },

  // School year settings
  getSchoolYearSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getSchoolYearSettings();
    }
    return await fetchClient.get("/settings/category/academic");
  },

  updateSchoolYearSettings: async (schoolYearData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateSchoolYearSettings(schoolYearData);
    }
    return await fetchClient.put("/settings", schoolYearData);
  },

  // Notification settings
  getNotificationSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getNotificationSettings();
    }
    return await fetchClient.get("/settings/category/notification");
  },

  updateNotificationSettings: async (notificationData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateNotificationSettings(
        notificationData
      );
    }
    return await fetchClient.put("/settings", notificationData);
  },

  // All settings (for settings page)
  getAllSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getAllSettings();
    }
    return await fetchClient.get("/settings");
  },

  // Backup settings
  backupSettings: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.backupSettings();
    }
    return await fetchClient.post(
      "/settings/backup",
      {},
      {
        responseType: "blob",
      }
    );
  },

  restoreSettings: async (backupFile) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.restoreSettings(backupFile);
    }
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
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.resetToDefaults(settingType);
    }
    return await fetchClient.post("/settings/reset", { settingType });
  },
};
