import { create } from "zustand";
import { applicationApi } from "../api/applicationApi";

export const useApplicationStore = create((set, get) => ({
  // State
  applications: [],
  currentApplication: null,
  applicationHistory: null,
  loading: false,
  error: null,

  // Initialize store - no longer needed with real API
  initialize: () => {
    set({
      applications: [],
      error: null,
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading });
  },

  // Fetch all applications (deprecated - use getAllApplications instead)
  fetchApplications: async () => {
    return get().getAllApplications();
  },

  // Get applications for a specific user
  getUserApplications: (userEmail) => {
    const { applications } = get();
    return applications.filter((app) => app.applicantEmail === userEmail);
  },

  // Get current (most recent) application for a user
  getCurrentApplication: async () => {
    try {
      set({ loading: true, error: null });

      const result = await applicationApi.getCurrentApplication();

      set({
        currentApplication: result.application,
        loading: false,
        error: null,
      });

      return result;
    } catch (error) {
      set({
        currentApplication: null,
        loading: false,
        error: error.message || "Failed to fetch current application",
      });
      return { application: null };
    }
  },

  // Create new application
  createApplication: async (applicationData) => {
    try {
      set({ loading: true, error: null });

      const result = await applicationApi.create(applicationData);

      // Add to applications array
      const { applications } = get();
      const updatedApplications = [...applications, result.application];

      set({
        applications: updatedApplications,
        currentApplication: result.application,
        loading: false,
        error: null,
      });

      return result;
    } catch (error) {
      set({
        loading: false,
        error: error.message || "Failed to create application",
      });
      throw error;
    }
  },

  // Update application status
  updateApplicationStatus: async (applicationId, status, reason = "") => {
    try {
      set({ loading: true, error: null });

      // Call the actual API
      const result = await applicationApi.updateStatus(
        applicationId,
        status,
        reason
      );

      // Update the applications array with the updated application
      const { applications } = get();
      const updatedApplications = applications.map((app) =>
        app.id === applicationId ? result.application : app
      );

      // Update current application if it matches
      const { currentApplication } = get();
      let updatedCurrentApp = currentApplication;
      if (currentApplication?.id === applicationId) {
        updatedCurrentApp = result.application;
      }

      set({
        applications: updatedApplications,
        currentApplication: updatedCurrentApp,
        loading: false,
        error: null,
      });

      return { success: true, application: result.application };
    } catch (error) {
      console.error("updateApplicationStatus error:", error);
      set({
        loading: false,
        error: error.message || "Failed to update application status",
      });
      throw error;
    }
  },

  // Add demo schedule to application
  scheduleDemo: async (applicationId, demoSchedule) => {
    return get().updateApplicationStatus(applicationId, "approved", {
      demoSchedule,
    });
  },

  // Add scores to application
  addScores: async (applicationId, scores) => {
    return get().updateApplicationStatus(applicationId, "completed", {
      scores,
    });
  },

  // Get application by ID
  getApplicationById: async (applicationId) => {
    try {
      set({ loading: true, error: null });

      // Call the actual API
      const result = await applicationApi.getById(applicationId);

      set({
        loading: false,
        error: null,
      });

      return { application: result.application };
    } catch (error) {
      console.error("getApplicationById error:", error);
      set({
        loading: false,
        error: error.message || "Failed to fetch application",
      });
      throw error;
    }
  },

  // Get application history for a user
  getApplicationHistory: async (userEmail = null) => {
    try {
      set({ loading: true, error: null });

      let result;
      if (userEmail) {
        // HR viewing specific user's history - fetch by email through getAll
        result = await applicationApi.getAll({ search: userEmail });
        set({ loading: false, error: null });
        return { applications: result.applications };
      } else {
        // Applicant viewing own history
        result = await applicationApi.getHistory();
        set({
          applicationHistory: result.applications,
          loading: false,
          error: null,
        });
        return { applications: result.applications };
      }
    } catch (error) {
      console.error("getApplicationHistory error:", error);
      set({
        loading: false,
        error: error.message || "Failed to fetch application history",
      });
      throw error;
    }
  },

  // Get all applications with filters
  getAllApplications: async (filters = {}) => {
    try {
      set({ loading: true, error: null });

      // Call the actual API
      const result = await applicationApi.getAll(filters);

      set({
        applications: result.applications,
        loading: false,
        error: null,
      });

      return { applications: result.applications, total: result.total };
    } catch (error) {
      console.error("getAllApplications error:", error);
      set({
        loading: false,
        error: error.message || "Failed to fetch applications",
        applications: [], // Clear applications on error
      });
      throw error;
    }
  },

  // Get applications by status
  getApplicationsByStatus: (status) => {
    const { applications } = get();
    return applications.filter(
      (app) => app.status.toLowerCase() === status.toLowerCase()
    );
  },

  // Get pending applications
  getPendingApplications: () => {
    return get().getApplicationsByStatus("pending");
  },

  // Get approved applications
  getApprovedApplications: () => {
    return get().getApplicationsByStatus("approved");
  },

  // Get completed applications
  getCompletedApplications: () => {
    return get().getApplicationsByStatus("completed");
  },

  // Search applications
  searchApplications: (searchTerm) => {
    const { applications } = get();
    if (!searchTerm) return applications;

    const term = searchTerm.toLowerCase();
    return applications.filter(
      (app) =>
        app.program?.toLowerCase().includes(term) ||
        app.position?.toLowerCase().includes(term) ||
        app.subjectSpecialization?.toLowerCase().includes(term) ||
        app.applicantEmail?.toLowerCase().includes(term) ||
        app.firstName?.toLowerCase().includes(term) ||
        app.lastName?.toLowerCase().includes(term)
    );
  },

  // Get application statistics
  getApplicationStats: () => {
    const { applications } = get();

    return {
      total: applications.length,
      pending: applications.filter(
        (app) => app.status.toLowerCase() === "pending"
      ).length,
      underReview: applications.filter(
        (app) => app.status.toLowerCase() === "under review"
      ).length,
      approved: applications.filter(
        (app) => app.status.toLowerCase() === "approved"
      ).length,
      completed: applications.filter(
        (app) => app.status.toLowerCase() === "completed"
      ).length,
      rejected: applications.filter(
        (app) => app.status.toLowerCase() === "rejected"
      ).length,
    };
  },

  // Get user-specific statistics
  getUserStats: (userEmail) => {
    const userApps = get().getUserApplications(userEmail);

    return {
      total: userApps.length,
      pending: userApps.filter((app) => app.status.toLowerCase() === "pending")
        .length,
      underReview: userApps.filter(
        (app) => app.status.toLowerCase() === "under review"
      ).length,
      approved: userApps.filter(
        (app) => app.status.toLowerCase() === "approved"
      ).length,
      completed: userApps.filter(
        (app) => app.status.toLowerCase() === "completed"
      ).length,
      rejected: userApps.filter(
        (app) => app.status.toLowerCase() === "rejected"
      ).length,
    };
  },

  // Delete application
  deleteApplication: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      await delay(500);

      const { applications, currentApplication } = get();
      const updatedApplications = applications.filter(
        (app) => app.id !== applicationId
      );

      // Clear current application if it was the deleted one
      const updatedCurrentApp =
        currentApplication?.id === applicationId ? null : currentApplication;

      set({
        applications: updatedApplications,
        currentApplication: updatedCurrentApp,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to delete application",
      });
      throw error;
    }
  },

  // Bulk update applications
  bulkUpdateApplications: async (applicationIds, updateData) => {
    try {
      set({ loading: true, error: null });
      await delay(1000);

      const { applications } = get();
      const updatedApplications = applications.map((app) => {
        if (applicationIds.includes(app.id)) {
          return {
            ...app,
            ...updateData,
            updatedAt: new Date().toISOString(),
          };
        }
        return app;
      });

      set({
        applications: updatedApplications,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to bulk update applications",
      });
      throw error;
    }
  },

  // Download document (simulation)
  downloadDocument: async (applicationId, documentName) => {
    try {
      set({ loading: true, error: null });
      await delay(1000);

      // Simulate document download
      const dummyContent = `This is a sample document: ${documentName} for application ${applicationId}`;
      const blob = new Blob([dummyContent], { type: "application/pdf" });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      set({
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to download document",
      });
      throw error;
    }
  },

  // Submit application (change status to pending)
  submitApplication: async (applicationId) => {
    return get().updateApplicationStatus(applicationId, "pending");
  },

  // Export applications data
  exportApplications: (format = "json") => {
    const { applications } = get();

    if (format === "json") {
      return JSON.stringify(applications, null, 2);
    }

    if (format === "csv") {
      if (applications.length === 0) return "";

      const headers = Object.keys(applications[0]).join(",");
      const rows = applications.map((app) =>
        Object.values(app)
          .map((value) => (typeof value === "string" ? `"${value}"` : value))
          .join(",")
      );

      return [headers, ...rows].join("\n");
    }

    return applications;
  },

  // Clear all application data
  clearApplications: () => {
    set({
      applications: [],
      currentApplication: null,
      applicationHistory: null,
      error: null,
    });
  },

  // Reset store to initial state
  reset: () => {
    set({
      applications: [],
      currentApplication: null,
      applicationHistory: null,
      loading: false,
      error: null,
    });
  },
}));
