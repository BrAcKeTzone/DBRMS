import { fetchClient } from "../utils/fetchClient";
import config from "../config";
import { dummyDataService } from "../services/dummyDataService";

export const studentsApi = {
  // Admin functions
  createStudent: async (studentData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.createStudent(studentData);
    }
    return await fetchClient.post("/api/students", studentData);
  },

  updateStudent: async (studentId, studentData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateStudent(studentId, studentData);
    }
    return await fetchClient.put(`/api/students/${studentId}`, studentData);
  },

  deleteStudent: async (studentId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteStudent(studentId);
    }
    return await fetchClient.delete(`/api/students/${studentId}`);
  },

  getAllStudents: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getAllStudents(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/students?${queryString}`);
  },

  getStudent: async (studentId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getStudent(studentId);
    }
    return await fetchClient.get(`/api/students/${studentId}`);
  },

  searchStudents: async (searchTerm) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.searchStudents(searchTerm);
    }
    return await fetchClient.get(
      `/api/students/search?q=${encodeURIComponent(searchTerm)}`
    );
  },

  // Parent linking functions
  linkParentToStudent: async (parentId, studentId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.linkParentToStudent(parentId, studentId);
    }
    return await fetchClient.post("/api/students/link-parent", {
      parentId,
      studentId,
    });
  },

  unlinkParentFromStudent: async (parentId, studentId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.unlinkParentFromStudent(
        parentId,
        studentId
      );
    }
    return await fetchClient.delete(
      `/api/students/unlink-parent/${parentId}/${studentId}`
    );
  },

  getPendingParentLinks: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getPendingParentLinks(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(
      `/api/students/pending-parent-links?${queryString}`
    );
  },

  approveParentLink: async (linkId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.approveParentLink(linkId);
    }
    return await fetchClient.patch(`/api/students/${linkId}/approve`);
  },

  rejectParentLink: async (linkId, reason = "") => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.rejectParentLink(linkId, reason);
    }
    return await fetchClient.patch(`/api/students/${linkId}/reject`, {
      rejectionReason: reason,
    });
  },

  // Parent functions
  requestStudentLink: async (studentData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.requestStudentLink(studentData);
    }
    // studentData should contain: { studentId, parentId }
    return await fetchClient.post("/api/students/link", studentData);
  },

  getMyChildren: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getMyChildren();
    }
    return await fetchClient.get("/api/students/my-children");
  },

  getMyLinkRequests: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getMyLinkRequests();
    }
    return await fetchClient.get("/api/students/my-link-requests");
  },

  // Admin: Unlink a student (set linkStatus back to PENDING)
  unlinkStudent: async (studentId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.unlinkStudent(studentId);
    }
    return await fetchClient.patch(`/api/students/${studentId}/unlink`);
  },

  // Utility functions
  getStudentsByGradeLevel: async (gradeLevel) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getStudentsByGradeLevel(gradeLevel);
    }
    return await fetchClient.get(`/api/students/by-grade/${gradeLevel}`);
  },

  getStudentsBySection: async (section) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getStudentsBySection(section);
    }
    return await fetchClient.get(
      `/api/students/by-section/${encodeURIComponent(section)}`
    );
  },

  getGradeLevels: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getGradeLevels();
    }
    return await fetchClient.get("/api/students/grade-levels");
  },

  getSections: async (gradeLevel = null) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getSections(gradeLevel);
    }
    const queryString = gradeLevel ? `?gradeLevel=${gradeLevel}` : "";
    return await fetchClient.get(`/api/students/sections${queryString}`);
  },

  // Student statistics (Admin only)
  getStudentStatistics: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getStudentStatistics();
    }
    return await fetchClient.get("/api/students/statistics");
  },

  // Bulk operations (Admin only)
  bulkImportStudents: async (file) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.bulkImportStudents(file);
    }
    const formData = new FormData();
    formData.append("file", file);

    return await fetchClient.post("/api/students/bulk-import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  exportStudents: async (params = {}) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.exportStudents(params);
    }
    const queryString = new URLSearchParams(params).toString();
    return await fetchClient.get(`/api/students/export?${queryString}`, {
      responseType: "blob",
    });
  },

  downloadStudentsTemplate: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.exportStudents();
    }
    return await fetchClient.get(`/api/students/template`, {
      responseType: "blob",
    });
  },

  clearOldRejectedLinks: async () => {
    if (config.USE_DUMMY_DATA) {
      return { data: { data: { clearedCount: 0 } } };
    }
    return await fetchClient.post(`/api/students/clear-rejected-links`);
  },
};
