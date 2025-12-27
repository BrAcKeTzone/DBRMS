// Configuration for DMRMS System

export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",

  // Feature flags
  FEATURES: {
    // Enable/disable specific features
    ENABLE_OTP: true,
    ENABLE_FILE_UPLOAD: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_REPORTS: true,
  },

  // UI Configuration
  UI: {
    // Items per page for pagination
    DEFAULT_PAGE_SIZE: 10,

    // Theme settings
    DEFAULT_THEME: "light",

    // Date format
    DATE_FORMAT: "YYYY-MM-DD",
    DATETIME_FORMAT: "YYYY-MM-DD HH:mm:ss",
  },
};

export default config;
