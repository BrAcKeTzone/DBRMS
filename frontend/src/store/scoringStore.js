import { create } from "zustand";
// Import rubrics data
import rubricsData from "../data/rubrics.json";

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const useScoringStore = create((set, get) => ({
  // State
  scores: null,
  rubricCriteria: null,
  statistics: null,
  loading: false,
  error: null,

  // Actions
  submitScores: async (applicationId, scoreData) => {
    try {
      set({ loading: true, error: null });
      await delay(1000);

      console.log(
        `Submitting scores for application ${applicationId}:`,
        scoreData
      );

      set({
        loading: false,
        error: null,
      });

      return { success: true, scores: scoreData };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to submit scores",
      });
      throw error;
    }
  },

  updateScores: async (applicationId, scoreData) => {
    try {
      set({ loading: true, error: null });
      await delay(800);

      console.log(
        `Updating scores for application ${applicationId}:`,
        scoreData
      );

      set({
        loading: false,
        error: null,
      });

      return { success: true, scores: scoreData };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to update scores",
      });
      throw error;
    }
  },

  getScores: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      await delay(400);

      // Sample scores for specific application
      const sampleScores = {
        applicationId,
        scores: [
          { criteria_id: "communication", score: 88 },
          { criteria_id: "knowledge", score: 92 },
          { criteria_id: "teaching_skills", score: 85 },
          { criteria_id: "professionalism", score: 80 },
        ],
        total_score: 85,
        result: "pass",
        feedback:
          "Good performance overall with room for improvement in classroom management.",
      };

      set({
        scores: sampleScores,
        loading: false,
        error: null,
      });

      return { scores: sampleScores };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch scores",
      });
      throw error;
    }
  },

  getMyScores: async () => {
    try {
      set({ loading: true, error: null });
      await delay(500);

      // Sample current user's scores
      const myScores = {
        applicationId: "app-1",
        scores: [
          { criteria_id: "communication", score: 88 },
          { criteria_id: "knowledge", score: 92 },
          { criteria_id: "teaching_skills", score: 85 },
          { criteria_id: "professionalism", score: 80 },
        ],
        total_score: 85,
        result: "pass",
        feedback:
          "Excellent demonstration with clear explanations and good student engagement.",
      };

      set({
        scores: myScores,
        loading: false,
        error: null,
      });

      return { scores: myScores };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch your scores",
      });
      throw error;
    }
  },

  getAllScores: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      await delay(600);

      // Sample all scores data
      const allScores = [
        {
          applicationId: "app-1",
          applicantName: "John Doe",
          program: "Secondary Education - Mathematics",
          total_score: 85,
          result: "pass",
          scored_at: "2024-03-01T14:00:00Z",
        },
        {
          applicationId: "app-6",
          applicantName: "Ana Gutierrez",
          program: "Special Education",
          total_score: 92,
          result: "pass",
          scored_at: "2024-02-28T13:45:00Z",
        },
      ];

      set({
        loading: false,
        error: null,
      });

      return { scores: allScores };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch all scores",
      });
      throw error;
    }
  },

  getRubricCriteria: async () => {
    try {
      set({ loading: true, error: null });
      await delay(300);

      // Use the imported rubrics data
      set({
        rubricCriteria: rubricsData,
        loading: false,
        error: null,
      });

      return { criteria: rubricsData };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch rubric criteria",
      });
      throw error;
    }
  },

  updateRubricCriteria: async (criteria) => {
    try {
      set({ loading: true, error: null });
      await delay(800);

      console.log("Updating rubric criteria:", criteria);

      set({
        rubricCriteria: criteria,
        loading: false,
        error: null,
      });

      return { criteria };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to update rubric criteria",
      });
      throw error;
    }
  },

  calculateTotal: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      await delay(200);

      // Simple calculation logic
      const calculatedTotal = {
        total_score: 85,
        result: "pass",
        breakdown: {
          communication: 88,
          knowledge: 92,
          teaching_skills: 85,
          professionalism: 80,
        },
      };

      set({
        loading: false,
        error: null,
      });

      return calculatedTotal;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to calculate total score",
      });
      throw error;
    }
  },

  getStatistics: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      await delay(500);

      // Sample statistics
      const statistics = {
        totalScored: 15,
        averageScore: 78.5,
        passRate: 73.3,
        topPerformers: [
          { name: "Ana Gutierrez", score: 92 },
          { name: "John Doe", score: 85 },
        ],
        criteriaAverages: {
          communication: 82.1,
          knowledge: 85.7,
          teaching_skills: 79.3,
          professionalism: 76.8,
        },
      };

      set({
        statistics,
        loading: false,
        error: null,
      });

      return { statistics };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch statistics",
      });
      throw error;
    }
  },

  exportReport: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      await delay(1500);

      // Simulate report generation
      const reportContent = `Scoring Report
Generated on: ${new Date().toLocaleDateString()}

Summary:
- Total Applications Scored: 15
- Average Score: 78.5%
- Pass Rate: 73.3%

Top Performers:
1. Ana Gutierrez - 92%
2. John Doe - 85%

Criteria Averages:
- Communication: 82.1%
- Knowledge: 85.7%
- Teaching Skills: 79.3%
- Professionalism: 76.8%`;

      const blob = new Blob([reportContent], { type: "application/pdf" });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scoring_report_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to export report",
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearScores: () => {
    set({
      scores: null,
      statistics: null,
      error: null,
    });
  },
}));
