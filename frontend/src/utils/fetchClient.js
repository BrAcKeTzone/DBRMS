import axios from "axios";

// Create axios instance with default configuration
const API_ROOT = import.meta.env.VITE_API_URL;

if (!API_ROOT) {
  throw new Error(
    "VITE_API_URL is not defined. Please set it in your frontend environment variables.",
  );
}

const BASE_API_URL = API_ROOT.endsWith("/api")
  ? API_ROOT
  : `${API_ROOT.replace(/\/$/, "")}/api`;

const fetchClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 30000, // Increased to 30 seconds for file uploads
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a special instance for file uploads with extended timeout
const fileUploadClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 120000, // 2 minutes for large file uploads
  headers: {},
});

import { useAuthStore } from "../store/authStore";

// Request interceptor to add auth token
fetchClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If we're sending FormData, remove the default Content-Type so
    // axios can set the correct multipart/form-data boundary automatically.
    if (config.data instanceof FormData) {
      if (config.headers) {
        // Try to remove Content-Type in a few possible header key formats
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
        if (config.headers.common) {
          delete config.headers.common["Content-Type"];
          delete config.headers.common["content-type"];
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle common responses
fetchClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - but not for login/auth endpoints
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes("/auth/");

      // Only redirect on 401 for non-auth endpoints (protected routes)
      if (!isAuthEndpoint) {
        // Clear auth state via store logout
        try {
          useAuthStore.getState().logout();
        } catch (e) {
          console.debug("Error calling logout on 401:", e);
        }

        // Prevent redirect loop by checking current location
        const currentPath = window.location.pathname;
        if (
          currentPath !== "/signin" &&
          currentPath !== "/signup" &&
          currentPath !== "/forgot-password"
        ) {
          // Use a small delay to prevent race conditions with React routing
          setTimeout(() => {
            window.location.href = "/signin";
          }, 100);
        }
      }
      // For auth endpoints (like login), let the error bubble up to be handled by the form
    }

    // Handle network errors
    if (!error.response) {
      error.response = {
        data: {
          message: "Network error. Please check your connection.",
        },
      };
    }

    return Promise.reject(error);
  },
);

// Request interceptor for file upload client
fileUploadClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData, let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for file upload client (same as main client)
fileUploadClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - but not for login/auth endpoints
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes("/auth/");

      if (!isAuthEndpoint) {
        try {
          useAuthStore.getState().logout();
        } catch (e) {
          console.debug("Error calling logout on 401 (file upload client):", e);
        }
        const currentPath = window.location.pathname;
        if (
          currentPath !== "/signin" &&
          currentPath !== "/signup" &&
          currentPath !== "/forgot-password"
        ) {
          setTimeout(() => {
            window.location.href = "/signin";
          }, 100);
        }
      }
    }

    // Handle network errors
    if (!error.response) {
      error.response = {
        data: {
          message: "Network error. Please check your connection.",
        },
      };
    }

    return Promise.reject(error);
  },
);

export { fetchClient, fileUploadClient };
