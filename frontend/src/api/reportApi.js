import { fetchClient } from "../utils/fetchClient";

const API_BASE_URL = "/api/reports";

export const reportApi = {
  // Get report statistics
  getReportStatistics: async (filters = {}) => {
    const response = await fetchClient.get(`${API_BASE_URL}/statistics`, {
      params: filters,
    });
    return response.data;
  },

  // Get dashboard analytics
  getDashboardAnalytics: async () => {
    const response = await fetchClient.get(`${API_BASE_URL}/analytics`);
    return response.data;
  },

  // Export applications to CSV
  exportApplicationsCSV: async (filters = {}) => {
    const response = await fetchClient.get(
      `${API_BASE_URL}/export/applications/csv`,
      {
        params: filters,
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Export scoring to CSV
  exportScoringCSV: async (filters = {}) => {
    const response = await fetchClient.get(
      `${API_BASE_URL}/export/scoring/csv`,
      {
        params: filters,
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Export applicants to CSV
  exportApplicantsCSV: async (filters = {}) => {
    const response = await fetchClient.get(
      `${API_BASE_URL}/export/applicants/csv`,
      {
        params: filters,
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Generate applications PDF
  generateApplicationsPDF: async (filters = {}) => {
    const response = await fetchClient.get(
      `${API_BASE_URL}/export/applications/pdf`,
      {
        params: filters,
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Generate scoring PDF
  generateScoringPDF: async (filters = {}) => {
    const response = await fetchClient.get(
      `${API_BASE_URL}/export/scoring/pdf`,
      {
        params: filters,
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Generate applicants PDF
  generateApplicantsPDF: async (filters = {}) => {
    const response = await fetchClient.get(
      `${API_BASE_URL}/export/applicants/pdf`,
      {
        params: filters,
        responseType: "blob",
      }
    );
    return response.data;
  },
};
