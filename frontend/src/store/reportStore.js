import { create } from "zustand";
import { reportApi } from "../api/reportApi";

export const useReportStore = create((set, get) => ({
  // State
  reportStatistics: null,
  dashboardAnalytics: null,
  loading: false,
  error: null,

  // Actions
  generateApplicationReport: async (filters = {}) => {
    try {
      set({ loading: true, error: null });

      // Call backend to generate PDF
      const blob = await reportApi.generateApplicationsPDF(filters);

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to generate application report",
      });
      throw error;
    }
  },

  generateScoringReport: async (filters = {}) => {
    try {
      set({ loading: true, error: null });

      // Call backend to generate PDF
      const blob = await reportApi.generateScoringPDF(filters);

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to generate scoring report",
      });
      throw error;
    }
  },

  generateApplicantReport: async (filters = {}) => {
    try {
      set({ loading: true, error: null });

      // Call backend to generate PDF
      const blob = await reportApi.generateApplicantsPDF(filters);

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to generate applicant report",
      });
      throw error;
    }
  },

  getReportStatistics: async (dateRange = {}) => {
    try {
      set({ loading: true, error: null });

      const response = await reportApi.getReportStatistics(dateRange);
      const statistics = response.data;

      set({
        reportStatistics: statistics,
        loading: false,
        error: null,
      });

      return { statistics };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch report statistics",
      });
      throw error;
    }
  },

  getDashboardAnalytics: async () => {
    try {
      set({ loading: true, error: null });

      const response = await reportApi.getDashboardAnalytics();
      const analytics = response.data;

      set({
        dashboardAnalytics: analytics,
        loading: false,
        error: null,
      });

      return analytics;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch dashboard analytics",
      });
      throw error;
    }
  },

  exportToCsv: async (dataType, filters = {}) => {
    try {
      set({ loading: true, error: null });

      let blob;

      switch (dataType) {
        case "applications":
          blob = await reportApi.exportApplicationsCSV(filters);
          break;
        case "scoring":
          blob = await reportApi.exportScoringCSV(filters);
          break;
        case "applicants":
          blob = await reportApi.exportApplicantsCSV(filters);
          break;
        default:
          throw new Error("Invalid data type");
      }

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to export to CSV",
      });
      throw error;
    }
  },

  exportToPdf: async (dataType, filters = {}) => {
    try {
      set({ loading: true, error: null });

      let blob;

      switch (dataType) {
        case "applications":
          blob = await reportApi.generateApplicationsPDF(filters);
          break;
        case "scoring":
          blob = await reportApi.generateScoringPDF(filters);
          break;
        case "applicants":
          blob = await reportApi.generateApplicantsPDF(filters);
          break;
        default:
          throw new Error("Invalid data type");
      }

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to export to PDF",
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearReports: () => {
    set({
      reportStatistics: null,
      dashboardAnalytics: null,
      error: null,
    });
  },
}));
