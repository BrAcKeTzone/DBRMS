import { create } from "zustand";
import { scheduleApi } from "../api/scheduleApi";

// Sample occupied time slots for conflict detection
const occupiedSlots = {
  "2024-03-15": ["10:00", "14:00"],
  "2024-03-20": ["14:00"],
  "2024-03-21": ["09:00", "11:00", "15:00"],
};

export const useScheduleStore = create((set, get) => ({
  // State
  schedules: null,
  mySchedule: null,
  availableSlots: null,
  loading: false,
  error: null,

  // Actions
  setDemoSchedule: async (applicationId, scheduleData) => {
    try {
      set({ loading: true, error: null });

      // Combine date and time into ISO DateTime string (without Z to keep it as local time)
      const demoScheduleDateTime = `${scheduleData.date}T${scheduleData.time}:00.000`;

      // Call real API with all schedule fields
      const response = await scheduleApi.setDemoSchedule(applicationId, {
        demoSchedule: demoScheduleDateTime,
        demoLocation: scheduleData.location || undefined,
        demoDuration: scheduleData.duration
          ? parseInt(scheduleData.duration)
          : undefined,
        demoNotes: scheduleData.notes || undefined,
      });

      set({
        loading: false,
        error: null,
      });

      return { success: true, schedule: response.data };
    } catch (error) {
      console.error("Failed to set demo schedule:", error);
      set({
        loading: false,
        error: error.message || "Failed to set demo schedule",
      });
      throw error;
    }
  },

  updateDemoSchedule: async (applicationId, scheduleData) => {
    try {
      set({ loading: true, error: null });

      // Combine date and time into ISO DateTime string (without Z to keep it as local time)
      const demoScheduleDateTime = `${scheduleData.date}T${scheduleData.time}:00.000`;

      // Call real API (same endpoint as setDemoSchedule) with all fields
      const response = await scheduleApi.updateDemoSchedule(applicationId, {
        demoSchedule: demoScheduleDateTime,
        demoLocation: scheduleData.location || undefined,
        demoDuration: scheduleData.duration
          ? parseInt(scheduleData.duration)
          : undefined,
        demoNotes: scheduleData.notes || undefined,
      });

      set({
        loading: false,
        error: null,
      });

      return { success: true, schedule: response.data };
    } catch (error) {
      console.error("Failed to update demo schedule:", error);
      set({
        loading: false,
        error: error.message || "Failed to update demo schedule",
      });
      throw error;
    }
  },

  getDemoSchedule: async (applicationId) => {
    try {
      set({ loading: true, error: null });

      // Call real API
      const response = await scheduleApi.getDemoSchedule(applicationId);

      set({
        loading: false,
        error: null,
      });

      return { schedule: response.data.demoSchedule };
    } catch (error) {
      console.error("Failed to fetch demo schedule:", error);
      set({
        loading: false,
        error: error.message || "Failed to fetch demo schedule",
      });
      throw error;
    }
  },

  getMyDemoSchedule: async () => {
    try {
      set({ loading: true, error: null });

      // Call real API
      const response = await scheduleApi.getMyDemoSchedule();

      set({
        mySchedule: response.data.demoSchedule,
        loading: false,
        error: null,
      });

      return { schedule: response.data.demoSchedule };
    } catch (error) {
      console.error("Failed to fetch my demo schedule:", error);
      set({
        mySchedule: null,
        loading: false,
        error: null,
      });
      return null;
    }
  },

  getAllSchedules: async (filters = {}) => {
    try {
      set({ loading: true, error: null });

      // Call real API
      const response = await scheduleApi.getAllSchedules(filters);

      set({
        schedules: response.data,
        loading: false,
        error: null,
      });

      return { schedules: response.data };
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      set({
        loading: false,
        error: error.message || "Failed to fetch schedules",
      });
      throw error;
    }
  },

  cancelDemoSchedule: async (applicationId, reason = "") => {
    try {
      set({ loading: true, error: null });

      // Backend expects to set demoSchedule to null to cancel
      const response = await scheduleApi.setDemoSchedule(applicationId, {
        demoSchedule: null,
      });

      // Update schedules if they exist in state
      const { schedules } = get();
      if (schedules) {
        const updatedSchedules = schedules.filter(
          (schedule) => schedule.applicationId !== applicationId
        );
        set({
          schedules: updatedSchedules,
          loading: false,
          error: null,
        });
      } else {
        set({ loading: false, error: null });
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to cancel demo schedule:", error);
      set({
        loading: false,
        error: error.message || "Failed to cancel demo schedule",
      });
      throw error;
    }
  },

  getAvailableSlots: async (date) => {
    try {
      set({ loading: true, error: null });

      // Get occupied slots for the date (currently using mock data)
      // TODO: Implement real API call to check booked time slots
      const occupied = occupiedSlots[date] || [];

      // Return occupied slots (slots that are NOT available)
      set({
        availableSlots: occupied,
        loading: false,
        error: null,
      });

      return occupied;
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
      set({
        loading: false,
        error: error.message || "Failed to fetch available slots",
      });
      throw error;
    }
  },

  confirmAttendance: async (applicationId) => {
    try {
      set({ loading: true, error: null });

      // TODO: Implement real API call when backend supports attendance confirmation
      console.log(`Confirming attendance for application ${applicationId}`);

      // Update my schedule if it matches
      const { mySchedule } = get();
      if (mySchedule && mySchedule.applicationId === applicationId) {
        set({
          mySchedule: { ...mySchedule, confirmed: true },
          loading: false,
          error: null,
        });
      } else {
        set({ loading: false, error: null });
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to confirm attendance:", error);
      set({
        loading: false,
        error: error.message || "Failed to confirm attendance",
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearSchedules: () => {
    set({
      schedules: null,
      mySchedule: null,
      availableSlots: null,
      error: null,
    });
  },
}));
