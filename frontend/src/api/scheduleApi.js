import { fetchClient } from "../utils/fetchClient";

/**
 * IMPORTANT: The backend does NOT have a separate /api/schedule endpoint.
 * Demo scheduling is handled through the applications API.
 * Use applicationApi.scheduleDemo() instead.
 *
 * Backend endpoint: PUT /api/applications/:id/schedule
 * This file is kept as a wrapper for backward compatibility.
 */

const API_BASE_URL = "/api/applications";

export const scheduleApi = {
  // Set/Update demo schedule for application (HR only)
  // Wrapper for PUT /api/applications/:id/schedule
  setDemoSchedule: async (applicationId, scheduleData) => {
    const response = await fetchClient.put(
      `${API_BASE_URL}/${applicationId}/schedule`,
      scheduleData
    );
    return response.data;
  },

  // Alias for setDemoSchedule
  updateDemoSchedule: async (applicationId, scheduleData) => {
    return scheduleApi.setDemoSchedule(applicationId, scheduleData);
  },

  // Get demo schedule for application
  // Note: Use applicationApi.getById() to get application with demoSchedule
  getDemoSchedule: async (applicationId) => {
    const response = await fetchClient.get(`${API_BASE_URL}/${applicationId}`);
    return {
      data: {
        demoSchedule: response.data.data?.demoSchedule,
        applicationId: response.data.data?.id,
        status: response.data.data?.status,
      },
    };
  },

  // Get current user's demo schedule (applicant)
  // Note: Use applicationApi.getCurrentApplication() instead
  getMyDemoSchedule: async () => {
    const response = await fetchClient.get(
      `${API_BASE_URL}/my-active-application`
    );
    return {
      data: {
        demoSchedule: response.data.data?.demoSchedule,
        applicationId: response.data.data?.id,
        status: response.data.data?.status,
      },
    };
  },

  // Get all scheduled demos (HR only)
  // Note: Use applicationApi.getAll() with status filter
  getAllSchedules: async (filters = {}) => {
    const response = await fetchClient.get(API_BASE_URL, {
      params: {
        ...filters,
        // Only get applications that have been approved (which may have schedules)
        status: "APPROVED",
      },
    });
    return {
      data: response.data.data?.applications?.filter(
        (app) => app.demoSchedule !== null
      ),
    };
  },
};
