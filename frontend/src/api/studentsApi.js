import { fetchClient } from "../utils/fetchClient";

export const studentsApi = {
  // Admin functions
  createStudent: async (studentData) => {
    return await fetchClient.post("/students", studentData);
  },

  updateStudent: async (studentId, studentData) => {
    return await fetchClient.put(`/students/${studentId}`, studentData);
  },

  deleteStudent: async (studentId) => {
    return await fetchClient.delete(`/students/${studentId}`);
  },

  getAllStudents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/students?${queryString}`);
  },

  getStudent: async (studentId) => {
    return await fetchClient.get(`/students/${studentId}`);
  },

  searchStudents: async (searchTerm) => {
    return await fetchClient.get(
      `/students/search?q=${encodeURIComponent(searchTerm)}`
    );
  },

  // Parent linking functions
  linkParentToStudent: async (parentId, studentId) => {
    return await fetchClient.post("/students/link-parent", {
      parentId,
      studentId,
    });
  },

  unlinkParentFromStudent: async (parentId, studentId) => {
    return await fetchClient.delete(
      `/students/unlink-parent/${parentId}/${studentId}`
    );
  },

  getPendingParentLinks: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/students/pending-parent-links?${queryString}`
    );
  },

  approveParentLink: async (linkId) => {
    return await fetchClient.patch(`/students/${linkId}/approve`);
  },

  rejectParentLink: async (linkId, reason = "") => {
    return await fetchClient.patch(`/students/${linkId}/reject`, {
      rejectionReason: reason,
    });
  },

  // Parent functions
  requestStudentLink: async (studentData) => {
    // studentData should contain: { studentId, parentId }
    return await fetchClient.post("/students/link", studentData);
  },

  getMyChildren: async () => {
    return await fetchClient.get("/students/my-children");
  },

  getMyLinkRequests: async () => {
    return await fetchClient.get("/students/my-link-requests");
  },

  // Admin: Unlink a student (set linkStatus back to PENDING)
  unlinkStudent: async (studentId) => {
    return await fetchClient.patch(`/students/${studentId}/unlink`);
  },

  // Utility functions
  getStudentsByGradeLevel: async (gradeLevel) => {
    return await fetchClient.get(`/students/by-grade/${gradeLevel}`);
  },

  getStudentsBySection: async (section) => {
    return await fetchClient.get(
      `/students/by-section/${encodeURIComponent(section)}`
    );
  },

  getGradeLevels: async () => {
    return await fetchClient.get("/students/grade-levels");
  },

  getSections: async (gradeLevel = null) => {
    const queryString = gradeLevel ? `?gradeLevel=${gradeLevel}` : "";
    return await fetchClient.get(`/students/sections${queryString}`);
  },

  // Student statistics (Admin only)
  getStudentStatistics: async () => {
    return await fetchClient.get("/students/statistics");
  },

  // Bulk operations (Admin only)
  bulkImportStudents: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return await fetchClient.post("/students/bulk-import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  exportStudents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/students/export?${queryString}`, {
      responseType: "blob",
    });
  },

  downloadStudentsTemplate: async () => {
    return await fetchClient.get(`/students/template`, {
      responseType: "blob",
    });
  },

  clearOldRejectedLinks: async () => {
    return await fetchClient.post(`/students/clear-rejected-links`);
  },
};
