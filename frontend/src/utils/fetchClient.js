import axios from "axios";

// Create axios instance with default configuration
const fetchClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
fetchClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If the data is FormData, delete Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
        // Clear the token
        localStorage.removeItem("authToken");

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
  }
);

export { fetchClient };
