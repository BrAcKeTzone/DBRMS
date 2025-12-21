// Configuration for PTA Management System
// Toggle between dummy data and real API calls

export const config = {
  // Set to true for demo/prototype mode, false for production
  USE_DUMMY_DATA: false, // Changed to false to use real backend

  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000", // Fixed port to 3000

  // Demo/Prototype Settings
  DEMO_MODE: {
    // Network delay simulation (in milliseconds)
    NETWORK_DELAY: 500,

    // Enable console logging for dummy data operations
    ENABLE_LOGGING: true,

    // Default admin credentials for demo
    DEMO_ADMIN: {
      email: "admin@jhcsc.edu.ph",
      password: "admin123",
    },

    // Default parent credentials for demo
    DEMO_PARENT: {
      email: "parent1@gmail.com",
      password: "parent123",
    },
  },

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
