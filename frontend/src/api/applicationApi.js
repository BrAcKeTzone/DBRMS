import { fetchClient } from "../utils/fetchClient";

const API_BASE_URL = "/api"; // Use relative path since fetchClient already has baseURL

export const applicationApi = {
  // Create new application
  create: async (applicationData) => {
    try {
      // Create FormData to handle file uploads
      const formData = new FormData();

      // Add text fields
      Object.keys(applicationData).forEach((key) => {
        if (
          key !== "documents" &&
          applicationData[key] !== null &&
          applicationData[key] !== undefined
        ) {
          formData.append(key, applicationData[key]);
        }
      });

      // Add document files
      if (applicationData.documents && applicationData.documents.length > 0) {
        applicationData.documents.forEach((doc, index) => {
          if (doc.file) {
            console.log(
              "Appending file:",
              doc.file.name,
              "Size:",
              doc.file.size,
              "Type:",
              doc.file.type
            );
            formData.append("documents", doc.file);
          }
        });
      }

      // Log FormData contents for debugging
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], ":", pair[1]);
      }

      const response = await fetchClient.post(
        `${API_BASE_URL}/applications`,
        formData,
        {
          headers: {
            // Don't set Content-Type - let axios set it with proper boundary
            "Content-Type": undefined,
          },
          timeout: 60000, // 60 seconds for file uploads
        }
      );

      return { application: response.data.data };
    } catch (error) {
      console.error("Error creating application:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create application";
      throw new Error(message);
    }
  },

  // Get current active application
  getCurrentApplication: async () => {
    try {
      const response = await fetchClient.get(
        `${API_BASE_URL}/applications/my-active-application`
      );
      return { application: response.data.data };
    } catch (error) {
      console.error("Error fetching current application:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch current application";
      throw new Error(message);
    }
  },

  // Get application history for current user
  getHistory: async () => {
    try {
      const response = await fetchClient.get(
        `${API_BASE_URL}/applications/my-applications`
      );
      return { applications: response.data.data };
    } catch (error) {
      console.error("Error fetching application history:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch application history";
      throw new Error(message);
    }
  },

  // Get application by ID
  getById: async (applicationId) => {
    try {
      const response = await fetchClient.get(
        `${API_BASE_URL}/applications/${applicationId}`
      );
      return { application: response.data.data };
    } catch (error) {
      console.error("Error fetching application:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Application not found";
      throw new Error(message);
    }
  },

  // Update application status (HR only)
  updateStatus: async (applicationId, status, reason = "") => {
    try {
      let endpoint = `${API_BASE_URL}/applications/${applicationId}`;
      let body = { status };

      // Use specific endpoints for approve/reject
      if (status === "APPROVED") {
        endpoint = `${API_BASE_URL}/applications/${applicationId}/approve`;
        body = { hrNotes: reason };
      } else if (status === "REJECTED") {
        endpoint = `${API_BASE_URL}/applications/${applicationId}/reject`;
        body = { hrNotes: reason };
      }

      const response = await fetchClient.put(endpoint, body);
      return { application: response.data.data };
    } catch (error) {
      console.error("Error updating application status:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update application status";
      throw new Error(message);
    }
  },

  // Get all applications (HR only) with filters
  getAll: async (filters = {}) => {
    try {
      const response = await fetchClient.get(`${API_BASE_URL}/applications`, {
        params: filters, // axios automatically converts to query params
      });

      return {
        applications: response.data.data.applications,
        total: response.data.data.total,
      };
    } catch (error) {
      console.error("Error fetching applications:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch applications";
      throw new Error(message);
    }
  },

  // Get applications for specific user (HR only)
  getByUserId: async (userId) => {
    try {
      const response = await fetchClient.get(`${API_BASE_URL}/applications`, {
        params: { userId },
      });
      return { applications: response.data.data.applications };
    } catch (error) {
      console.error("Error fetching user applications:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch user applications";
      throw new Error(message);
    }
  },

  // Get application documents list
  getDocuments: async (applicationId) => {
    try {
      const response = await fetchClient.get(
        `${API_BASE_URL}/applications/${applicationId}/documents`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch documents";
      throw new Error(message);
    }
  },

  // Download application document
  downloadDocument: async (applicationId, documentIndex) => {
    try {
      // Get document list first
      const { documents } = await applicationApi.getDocuments(applicationId);

      if (!documents || !documents[documentIndex]) {
        throw new Error("Document not found");
      }

      const document = documents[documentIndex];
      const filename =
        document.originalName ||
        document.fileName ||
        `document-${documentIndex + 1}`;

      // Download from Cloudinary URL
      return await applicationApi.downloadFromUrl(document.url, filename);
    } catch (error) {
      console.error("Error downloading document:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to download document";
      throw new Error(message);
    }
  },

  // Direct download from URL (for Cloudinary URLs)
  downloadFromUrl: async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true };
    } catch (error) {
      console.error("Error downloading from URL:", error);
      throw new Error("Failed to download file");
    }
  },

  // Schedule demo for application (HR only)
  // Backend endpoint: PUT /api/applications/:id/schedule
  scheduleDemo: async (applicationId, demoSchedule) => {
    try {
      const response = await fetchClient.put(
        `${API_BASE_URL}/applications/${applicationId}/schedule`,
        { demoSchedule } // ISO date string
      );
      return { application: response.data.data };
    } catch (error) {
      console.error("Error scheduling demo:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to schedule demo";
      throw new Error(message);
    }
  },

  // Submit for review (change status from draft to pending)
  submit: async (applicationId) => {
    try {
      const response = await fetchClient.put(
        `${API_BASE_URL}/applications/${applicationId}`,
        {
          status: "PENDING",
        }
      );
      return { application: response.data.data };
    } catch (error) {
      console.error("Error submitting application:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit application";
      throw new Error(message);
    }
  },

  // Complete application with score and result (HR only)
  completeApplication: async (
    applicationId,
    totalScore,
    result,
    hrNotes = ""
  ) => {
    try {
      const response = await fetchClient.put(
        `${API_BASE_URL}/applications/${applicationId}/complete`,
        {
          totalScore: parseFloat(totalScore),
          result: result.toUpperCase(),
          hrNotes,
        }
      );
      return { application: response.data.data };
    } catch (error) {
      console.error("Error completing application:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to complete application";
      throw new Error(message);
    }
  },
};
