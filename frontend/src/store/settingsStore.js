import { create } from "zustand";
import { persist } from "zustand/middleware";
import { settingsApi } from "../api/settingsApi";

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // State
      systemSettings: {},
      notificationSettings: {},
      loading: false,
      error: null,

      // System settings actions
      fetchSystemSettings: async () => {
        try {
          set({ loading: true, error: null });
          const response = await settingsApi.getSystemSettings();
          const settings = response.data?.data || response.data || {};
          set({ systemSettings: settings, loading: false });
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

      // Notification settings
      fetchNotificationSettings: async () => {
        try {
          set({ loading: true, error: null });
          const response = await settingsApi.getNotificationSettings();
          const settings = response.data?.data || response.data || {};
          set({ notificationSettings: settings, loading: false });
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
          // Refresh notification settings
          await get().fetchNotificationSettings();
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

      // Backup and restore (XLSX)
      createBackup: async () => {
        try {
          set({ loading: true, error: null });
          const response = await settingsApi.backupSettings();
          set({ loading: false });

          // Handle blob and download as XLSX
          const blobData = response.data || response;
          const blob = new Blob([blobData], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `dmrms-backup-${
            new Date().toISOString().split("T")[0]
          }.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // Refresh system settings to get updated lastBackup date
          await get().fetchSystemSettings();
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
          await settingsApi.restoreSettings(backupFile);
          set({ loading: false });
          // Refresh all settings
          await get().fetchSystemSettings();
          await get().fetchNotificationSettings();
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to restore backup",
            loading: false,
          });
          throw error;
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),

      resetState: () =>
        set({
          systemSettings: {},
          notificationSettings: {},
          loading: false,
          error: null,
        }),
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({
        notificationSettings: state.notificationSettings,
      }),
    },
  ),
);
