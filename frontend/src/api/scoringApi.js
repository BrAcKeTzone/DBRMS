import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/scoring";

export const scoringApi = {
  // ========== RUBRIC MANAGEMENT ==========

  // Create new rubric (HR/Admin only)
  createRubric: async (rubricData) => {
    const response = await fetchClient.post(`${API_BASE}/rubrics`, rubricData);
    return response.data;
  },

  // Get all rubrics (HR/Admin only)
  getAllRubrics: async (includeInactive = false) => {
    const params = includeInactive ? "?includeInactive=true" : "";
    const response = await fetchClient.get(`${API_BASE}/rubrics${params}`);
    return response.data;
  },

  // Get rubric by ID (HR/Admin only)
  getRubricById: async (rubricId) => {
    const response = await fetchClient.get(`${API_BASE}/rubrics/${rubricId}`);
    return response.data;
  },

  // Update rubric (HR/Admin only)
  updateRubric: async (rubricId, rubricData) => {
    const response = await fetchClient.put(
      `${API_BASE}/rubrics/${rubricId}`,
      rubricData
    );
    return response.data;
  },

  // Delete rubric (Admin only)
  deleteRubric: async (rubricId) => {
    const response = await fetchClient.delete(
      `${API_BASE}/rubrics/${rubricId}`
    );
    return response.data;
  },

  // ========== SCORE MANAGEMENT ==========

  // Create/Submit score for application (HR only)
  createScore: async (scoreData) => {
    const response = await fetchClient.post(`${API_BASE}/scores`, scoreData);
    return response.data;
  },

  // Get scores for specific application
  getScoresByApplication: async (applicationId) => {
    const response = await fetchClient.get(
      `${API_BASE}/applications/${applicationId}/scores`
    );
    return response.data;
  },

  // Update existing score (HR only)
  updateScore: async (applicationId, rubricId, scoreData) => {
    const response = await fetchClient.put(
      `${API_BASE}/applications/${applicationId}/scores/${rubricId}`,
      scoreData
    );
    return response.data;
  },

  // Delete score (HR only)
  deleteScore: async (applicationId, rubricId) => {
    const response = await fetchClient.delete(
      `${API_BASE}/applications/${applicationId}/scores/${rubricId}`
    );
    return response.data;
  },

  // ========== SCORE CALCULATION ==========

  // Calculate total score for application (HR only)
  calculateApplicationScore: async (applicationId) => {
    const response = await fetchClient.get(
      `${API_BASE}/applications/${applicationId}/calculate`
    );
    return response.data;
  },

  // Complete application scoring (HR only)
  completeApplicationScoring: async (applicationId) => {
    const response = await fetchClient.post(
      `${API_BASE}/applications/${applicationId}/complete`
    );
    return response.data;
  },

  // Get application scores summary
  getApplicationScoresSummary: async (applicationId) => {
    const response = await fetchClient.get(
      `${API_BASE}/applications/${applicationId}/summary`
    );
    return response.data;
  },
};
