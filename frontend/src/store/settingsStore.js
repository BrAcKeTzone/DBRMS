import { create } from "zustand";
import { persist } from "zustand/middleware";
import { settingsApi } from "../api/settingsApi";

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // State
      systemSettings: {},
      userSettings: {},
      schoolInfo: {},
      paymentSettings: {},
      emailSettings: {},
      notificationSettings: {},
      loading: false,
      error: null,

      // System settings actions
      fetchSystemSettings: async () => {
        try {
          set({ loading: true, error: null });
          const response = await settingsApi.getSystemSettings();
          set({ systemSettings: response.data || {}, loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch system settings",
            loading: false,
          });
        }
      },

      updateSystemSettings: async (settingsData) => {
        try {
          set({ loading: true, error: null });
          await settingsApi.updateSystemSettings(settingsData);
          // Refresh system settings
          await get().fetchSystemSettings();
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to update system settings",
            loading: false,
          });
          throw error;
        }
      },

      // School information settings
      fetchSchoolInfo: async () => {
        try {
          set({ loading: true, error: null });
          const response = await settingsApi.getSchoolInfo();
          set({ schoolInfo: response.data || {}, loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch school information",
            loading: false,
          });
        }
      },

      updateSchoolInfo: async (schoolData) => {
        try {
          set({ loading: true, error: null });
          await settingsApi.updateSchoolInfo(schoolData);
          // Refresh school info
          await get().fetchSchoolInfo();
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to update school information",
            loading: false,
          });
          throw error;
        }
      },

      uploadSchoolLogo: async (logoFile) => {
        try {
          set({ loading: true, error: null });
          const formData = new FormData();
          formData.append("logo", logoFile);
          await settingsApi.uploadSchoolLogo(formData);
          // Refresh school info
          await get().fetchSchoolInfo();
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to upload school logo",
            loading: false,
          });
          throw error;
        }
      },

      // Payment settings
      fetchPaymentSettings: async () => {
        try {
          set({ loading: true, error: null });
          const response = await settingsApi.getPaymentSettings();
          set({ paymentSettings: response.data || {}, loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch payment settings",
            loading: false,
          });
        }
      },

      updatePaymentSettings: async (paymentData) => {
        try {
          set({ loading: true, error: null });
          await settingsApi.updatePaymentSettings(paymentData);
          // Refresh payment settings
          await get().fetchPaymentSettings();
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to update payment settings",
            loading: false,
          });
          throw error;
        }
      },

      // Email settings
      fetchEmailSettings: async () => {
        try {
          set({ loading: true, error: null });
          const response = await settingsApi.getEmailSettings();
          set({ emailSettings: response.data || {}, loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to fetch email settings",
            loading: false,
          });
        }
      },

      updateEmailSettings: async (emailData) => {
        try {
          set({ loading: true, error: null });
          await settingsApi.updateEmailSettings(emailData);
          // Refresh email settings
          await get().fetchEmailSettings();
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to update email settings",
            loading: false,
          });
          throw error;
        }
      },

      testEmailSettings: async () => {
        try {
          set({ loading: true, error: null });
          await settingsApi.testEmailSettings();
          set({ loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to test email settings",
            loading: false,
          });
          throw error;
        }
      },

      // User settings (preferences)
      fetchUserSettings: async () => {
        try {
          set({ loading: true, error: null });
          const response = await settingsApi.getUserSettings();
          set({ userSettings: response.data || {}, loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to fetch user settings",
            loading: false,
          });
        }
      },

      updateUserSettings: async (userSettingsData) => {
        try {
          set({ loading: true, error: null });
          await settingsApi.updateUserSettings(userSettingsData);
          // Update local state immediately for better UX
          set((state) => ({
            userSettings: { ...state.userSettings, ...userSettingsData },
            loading: false,
          }));
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to update user settings",
            loading: false,
          });
          throw error;
        }
      },

      // Notification settings
      fetchNotificationSettings: async () => {
        try {
          set({ loading: true, error: null });
          const response = await settingsApi.getNotificationSettings();
          set({ notificationSettings: response.data || {}, loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch notification settings",
            loading: false,
          });
        }
      },

      updateNotificationSettings: async (notificationData) => {
        try {
          set({ loading: true, error: null });
          await settingsApi.updateNotificationSettings(notificationData);
          // Update local state immediately for better UX
          set((state) => ({
            notificationSettings: {
              ...state.notificationSettings,
              ...notificationData,
            },
            loading: false,
          }));
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to update notification settings",
            loading: false,
          });
          throw error;
        }
      },

      // Backup and restore
      createBackup: async () => {
        try {
          set({ loading: true, error: null });
          const response = await settingsApi.createBackup();
          set({ loading: false });

          // Create blob and download
          const blob = new Blob([response.data], { type: "application/zip" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `pta-backup-${
            new Date().toISOString().split("T")[0]
          }.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to create backup",
            loading: false,
          });
          throw error;
        }
      },

      restoreBackup: async (backupFile) => {
        try {
          set({ loading: true, error: null });
          const formData = new FormData();
          formData.append("backup", backupFile);
          await settingsApi.restoreBackup(formData);
          set({ loading: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to restore backup",
            loading: false,
          });
          throw error;
        }
      },

      // System maintenance
      clearCache: async () => {
        try {
          set({ loading: true, error: null });
          await settingsApi.clearCache();
          set({ loading: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to clear cache",
            loading: false,
          });
          throw error;
        }
      },

      optimizeDatabase: async () => {
        try {
          set({ loading: true, error: null });
          await settingsApi.optimizeDatabase();
          set({ loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to optimize database",
            loading: false,
          });
          throw error;
        }
      },

      getSystemStatus: async () => {
        try {
          set({ loading: true, error: null });
          const response = await settingsApi.getSystemStatus();
          set({ loading: false });
          return response.data;
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to get system status",
            loading: false,
          });
          throw error;
        }
      },

      // Local state utilities
      getSetting: (settingPath, defaultValue = null) => {
        const { systemSettings, userSettings } = get();
        const allSettings = { ...systemSettings, ...userSettings };

        // Support nested property access like 'theme.mode' or 'notifications.email'
        const keys = settingPath.split(".");
        let value = allSettings;

        for (const key of keys) {
          value = value?.[key];
          if (value === undefined) break;
        }

        return value !== undefined ? value : defaultValue;
      },

      updateLocalSetting: (settingPath, value) => {
        set((state) => {
          const keys = settingPath.split(".");
          const lastKey = keys.pop();
          let target = state.userSettings;

          // Navigate to the parent object
          for (const key of keys) {
            if (!target[key]) target[key] = {};
            target = target[key];
          }

          // Set the value
          target[lastKey] = value;

          return {
            userSettings: { ...state.userSettings },
          };
        });
      },

      // Theme management
      setTheme: async (theme) => {
        await get().updateUserSettings({ theme });
      },

      getTheme: () => {
        return get().getSetting("theme", "light");
      },

      // Language management
      setLanguage: async (language) => {
        await get().updateUserSettings({ language });
      },

      getLanguage: () => {
        return get().getSetting("language", "en");
      },

      // Notification preferences
      isNotificationEnabled: (notificationType) => {
        return get().getSetting(`notifications.${notificationType}`, true);
      },

      toggleNotification: async (notificationType) => {
        const currentValue = get().isNotificationEnabled(notificationType);
        const newSettings = {
          notifications: {
            ...get().notificationSettings,
            [notificationType]: !currentValue,
          },
        };
        await get().updateNotificationSettings(newSettings);
      },

      // System information
      getSystemInfo: () => {
        const { systemSettings, schoolInfo } = get();
        return {
          version: systemSettings.version || "1.0.0",
          schoolName: schoolInfo.name || "JHCSC Dumingag Campus",
          academicYear: systemSettings.academicYear || new Date().getFullYear(),
          semester: systemSettings.semester || "1st Semester",
          lastBackup: systemSettings.lastBackup,
          maintenanceMode: systemSettings.maintenanceMode || false,
        };
      },

      // Validation utilities
      validateSchoolInfo: (schoolData) => {
        const errors = {};

        if (!schoolData.name?.trim()) {
          errors.name = "School name is required";
        }

        if (!schoolData.address?.trim()) {
          errors.address = "School address is required";
        }

        if (schoolData.email && !/\S+@\S+\.\S+/.test(schoolData.email)) {
          errors.email = "Invalid email format";
        }

        if (schoolData.phone && !/^[\d\s\-\+\(\)]+$/.test(schoolData.phone)) {
          errors.phone = "Invalid phone number format";
        }

        return {
          isValid: Object.keys(errors).length === 0,
          errors,
        };
      },

      validatePaymentSettings: (paymentData) => {
        const errors = {};

        if (paymentData.enableOnlinePayment) {
          if (!paymentData.paymentGateway) {
            errors.paymentGateway = "Payment gateway is required";
          }

          if (!paymentData.merchantId?.trim()) {
            errors.merchantId = "Merchant ID is required";
          }

          if (!paymentData.apiKey?.trim()) {
            errors.apiKey = "API key is required";
          }
        }

        return {
          isValid: Object.keys(errors).length === 0,
          errors,
        };
      },

      // Utility actions
      clearError: () => set({ error: null }),

      resetState: () =>
        set({
          systemSettings: {},
          userSettings: {},
          schoolInfo: {},
          paymentSettings: {},
          emailSettings: {},
          notificationSettings: {},
          loading: false,
          error: null,
        }),
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({
        userSettings: state.userSettings,
        notificationSettings: state.notificationSettings,
      }),
    }
  )
);
