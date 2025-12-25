import { create } from "zustand";
import { persist } from "zustand/middleware";
import { studentsApi } from "../api/studentsApi";

export const useStudentsStore = create(
  persist(
    (set, get) => ({
      // State
      students: [],
      myChildren: [], // For parent view
      studentDetails: null, // Single student details
      loading: false,
      error: null,

      // Admin actions
      fetchAllStudents: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await studentsApi.getAllStudents(params);

          // Normalize different response shapes (axios ApiResponse or dummy service responses)
          let studentsArray = [];
          const respData = response?.data ?? response;

          if (Array.isArray(respData)) {
            studentsArray = respData;
          } else if (Array.isArray(respData.data)) {
            studentsArray = respData.data;
          } else if (Array.isArray(respData.students)) {
            studentsArray = respData.students;
          } else if (Array.isArray(respData.data?.students)) {
            studentsArray = respData.data.students;
          } else {
            studentsArray = [];
          }

          set({ students: studentsArray, loading: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to fetch students",
            loading: false,
          });
        }
      },

      addStudent: async (studentData) => {
        try {
          set({ loading: true, error: null });
          await studentsApi.addStudent(studentData);
          // Refresh students list
          await get().fetchAllStudents();
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to add student",
            loading: false,
          });
          throw error;
        }
      },

      updateStudent: async (studentId, studentData) => {
        try {
          set({ loading: true, error: null });
          await studentsApi.updateStudent(studentId, studentData);
          // Refresh students list
          await get().fetchAllStudents();
          // Update studentDetails if it's the same student
          if (get().studentDetails?.id === studentId) {
            await get().fetchStudentDetails(studentId);
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to update student",
            loading: false,
          });
          throw error;
        }
      },

      deleteStudent: async (studentId) => {
        try {
          set({ loading: true, error: null });
          await studentsApi.deleteStudent(studentId);
          // Refresh students list
          await get().fetchAllStudents();
          // Clear studentDetails if it's the deleted student
          if (get().studentDetails?.id === studentId) {
            set({ studentDetails: null });
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to delete student",
            loading: false,
          });
          throw error;
        }
      },

      fetchStudentDetails: async (studentId) => {
        try {
          set({ loading: true, error: null });
          const response = await studentsApi.getStudentDetails(studentId);
          // normalize response shapes
          const payload =
            response?.data?.data ?? response?.data ?? response ?? null;
          set({ studentDetails: payload, loading: false });
          return payload;
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch student details",
            loading: false,
          });
          throw error;
        }
      },

      updateStudentStatus: async (studentId, status) => {
        try {
          set({ loading: true, error: null });
          await studentsApi.updateStudentStatus(studentId, status);
          // Refresh students list
          await get().fetchAllStudents();
          // Update studentDetails if it's the same student
          if (get().studentDetails?.id === studentId) {
            await get().fetchStudentDetails(studentId);
          }
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to update student status",
            loading: false,
          });
          throw error;
        }
      },

      bulkUpdateStudents: async (studentIds, updateData) => {
        try {
          set({ loading: true, error: null });
          await studentsApi.bulkUpdateStudents({ studentIds, ...updateData });
          // Refresh students list
          await get().fetchAllStudents();
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to bulk update students",
            loading: false,
          });
          throw error;
        }
      },

      exportStudentsList: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await studentsApi.exportStudents(params);
          set({ loading: false });

          // Create blob and download
          const blob = new Blob([response.data], {
            type:
              params.format === "pdf"
                ? "application/pdf"
                : params.format === "csv"
                ? "text/csv"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `students-list.${params.format || "xlsx"}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to export students list",
            loading: false,
          });
          throw error;
        }
      },

      uploadStudentPhoto: async (studentId, photoFile) => {
        try {
          set({ loading: true, error: null });
          const formData = new FormData();
          formData.append("photo", photoFile);
          await studentsApi.uploadStudentPhoto(studentId, formData);
          // Refresh student details
          if (get().studentDetails?.id === studentId) {
            await get().fetchStudentDetails(studentId);
          }
          set({ loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to upload student photo",
            loading: false,
          });
          throw error;
        }
      },

      // Parent actions
      fetchMyChildren: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await studentsApi.getMyChildren(params);

          const respData = response?.data ?? response;
          const myChildrenArray = Array.isArray(respData)
            ? respData
            : Array.isArray(respData.data)
            ? respData.data
            : Array.isArray(respData.data?.data)
            ? respData.data.data
            : Array.isArray(respData.data?.students)
            ? respData.data.students
            : Array.isArray(respData.students)
            ? respData.students
            : [];

          set({ myChildren: myChildrenArray, loading: false });
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to fetch my children",
            loading: false,
          });
        }
      },

      addMyChild: async (childData) => {
        try {
          set({ loading: true, error: null });
          await studentsApi.addMyChild(childData);
          // Refresh my children list
          await get().fetchMyChildren();
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to add child",
            loading: false,
          });
          throw error;
        }
      },

      updateMyChild: async (childId, childData) => {
        try {
          set({ loading: true, error: null });
          await studentsApi.updateMyChild(childId, childData);
          // Refresh my children list
          await get().fetchMyChildren();
          // Update studentDetails if it's the same child
          if (get().studentDetails?.id === childId) {
            await get().fetchStudentDetails(childId);
          }
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to update child information",
            loading: false,
          });
          throw error;
        }
      },

      // Search and filter functionality
      searchStudents: async (searchTerm, params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await studentsApi.searchStudents(searchTerm, params);
          set({ loading: false });

          const respData = response?.data ?? response;
          return respData?.data ?? respData?.students ?? respData ?? [];
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to search students",
            loading: false,
          });
          throw error;
        }
      },

      // Local state utilities
      getFilteredStudents: (filter = "all") => {
        const { students } = get();

        switch (filter) {
          case "active":
            return students.filter((student) => student.status === "active");
          case "inactive":
            return students.filter((student) => student.status === "inactive");
          case "graduated":
            return students.filter((student) => student.status === "graduated");
          case "transferred":
            return students.filter(
              (student) => student.status === "transferred"
            );
          case "all":
          default:
            return students;
        }
      },

      getStudentsByGradeLevel: (gradeLevel) => {
        return get().students.filter(
          (student) => student.gradeLevel === gradeLevel
        );
      },

      getStudentsBySection: (section) => {
        return get().students.filter((student) => student.section === section);
      },

      getSortedStudents: (students, sortBy = "lastName", sortOrder = "asc") => {
        return [...students].sort((a, b) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];

          // Handle nested properties
          if (sortBy.includes(".")) {
            const keys = sortBy.split(".");
            aValue = keys.reduce((obj, key) => obj?.[key], a);
            bValue = keys.reduce((obj, key) => obj?.[key], b);
          }

          // Handle string sorting
          if (typeof aValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (sortOrder === "desc") {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      },

      // Statistics and analytics
      getStudentStatistics: () => {
        const { students } = get();
        const studentsArr = Array.isArray(students) ? students : [];

        // Count by status
        const statusCounts = studentsArr.reduce((acc, student) => {
          acc[student.status] = (acc[student.status] || 0) + 1;
          return acc;
        }, {});

        // Count by grade level
        const gradeLevelCounts = studentsArr.reduce((acc, student) => {
          acc[student.gradeLevel] = (acc[student.gradeLevel] || 0) + 1;
          return acc;
        }, {});

        // Count by gender
        const genderCounts = studentsArr.reduce((acc, student) => {
          acc[student.gender] = (acc[student.gender] || 0) + 1;
          return acc;
        }, {});

        return {
          total: studentsArr.length,
          active: statusCounts.active || 0,
          inactive: statusCounts.inactive || 0,
          graduated: statusCounts.graduated || 0,
          transferred: statusCounts.transferred || 0,
          gradeLevelCounts,
          genderCounts,
          averageAge:
            studentsArr.length > 0
              ? Math.round(
                  studentsArr.reduce(
                    (sum, student) => sum + (student.age || 0),
                    0
                  ) / studentsArr.length
                )
              : 0,
        };
      },

      getMyChildrenSummary: () => {
        const { myChildren } = get();

        return {
          total: myChildren.length,
          active: myChildren.filter((child) => child.status === "active")
            .length,
          gradeDistribution: myChildren.reduce((acc, child) => {
            acc[child.gradeLevel] = (acc[child.gradeLevel] || 0) + 1;
            return acc;
          }, {}),
          upcomingEvents: myChildren.reduce((count, child) => {
            // Count upcoming events for each child (if available in student data)
            return count + (child.upcomingEvents?.length || 0);
          }, 0),
        };
      },

      // Validation utilities
      validateStudentData: (studentData) => {
        const errors = {};

        if (!studentData.firstName?.trim()) {
          errors.firstName = "First name is required";
        }

        if (!studentData.lastName?.trim()) {
          errors.lastName = "Last name is required";
        }

        if (!studentData.studentId?.trim()) {
          errors.studentId = "Student ID is required";
        }

        if (!studentData.gradeLevel) {
          errors.gradeLevel = "Grade level is required";
        }

        if (!studentData.section?.trim()) {
          errors.section = "Section is required";
        }

        if (studentData.email && !/\S+@\S+\.\S+/.test(studentData.email)) {
          errors.email = "Invalid email format";
        }

        return {
          isValid: Object.keys(errors).length === 0,
          errors,
        };
      },

      // Utility actions
      clearError: () => set({ error: null }),

      clearStudentDetails: () => set({ studentDetails: null }),

      resetState: () =>
        set({
          students: [],
          myChildren: [],
          studentDetails: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "students-storage",
      partialize: (state) => ({
        // Don't persist any student data for privacy/security
      }),
    }
  )
);
