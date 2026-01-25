import { fetchClient } from "../utils/fetchClient";

export const settingsApi = {
  // System settings
  getSystemSettings: async () => {
    return await fetchClient.get("/settings/category/system");
  },

  updateSystemSettings: async (systemData) => {
    return await fetchClient.put("/settings", systemData);
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

  // Initialize (first time)
  initializeSettings: async () => {
    return await fetchClient.post("/settings/initialize", {});
  },
};
