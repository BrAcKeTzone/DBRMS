/**
 * Application constants matching backend Prisma schema enums
 * These values must match the backend exactly
 */

// User Roles (from backend: enum UserRole)
export const USER_ROLES = {
  GUARDIAN: "GUARDIAN",
  CLINIC_STAFF: "CLINIC_STAFF",
};

// Application Status (from backend: enum ApplicationStatus)
export const APPLICATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
};

// Application Result (from backend: enum ApplicationResult)
export const APPLICATION_RESULT = {
  PASS: "PASS",
  FAIL: "FAIL",
};

// Notification Types (from backend notification service)
export const NOTIFICATION_TYPES = {
  SUBMISSION: "submission",
  APPROVAL: "approval",
  REJECTION: "rejection",
  SCHEDULE: "schedule",
  RESULT: "result",
  HR_ALERT: "hr_alert",
};

// Status Display Labels
export const STATUS_LABELS = {
  [APPLICATION_STATUS.PENDING]: "Pending Review",
  [APPLICATION_STATUS.APPROVED]: "Approved",
  [APPLICATION_STATUS.REJECTED]: "Rejected",
  [APPLICATION_STATUS.COMPLETED]: "Completed",
};

// Result Display Labels
export const RESULT_LABELS = {
  [APPLICATION_RESULT.PASS]: "Passed",
  [APPLICATION_RESULT.FAIL]: "Failed",
};

// Role Display Labels
export const ROLE_LABELS = {
  [USER_ROLES.GUARDIAN]: "Guardian",
  [USER_ROLES.CLINIC_STAFF]: "Clinic Staff",
};

// Status Colors for UI
export const STATUS_COLORS = {
  [APPLICATION_STATUS.PENDING]: "yellow",
  [APPLICATION_STATUS.APPROVED]: "green",
  [APPLICATION_STATUS.REJECTED]: "red",
  [APPLICATION_STATUS.COMPLETED]: "blue",
};

// Result Colors for UI
export const RESULT_COLORS = {
  [APPLICATION_RESULT.PASS]: "green",
  [APPLICATION_RESULT.FAIL]: "red",
};

// API Response Structure (matching backend ApiResponse)
export const API_RESPONSE_STRUCTURE = {
  SUCCESS: true,
  STATUS_CODE: "statusCode",
  DATA: "data",
  MESSAGE: "message",
  ERRORS: "errors",
};

// Default Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// File Upload Constraints (should match backend)
export const UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ALLOWED_EXTENSIONS: [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
};

// Scoring Constraints
export const SCORING = {
  DEFAULT_MAX_SCORE: 10,
  DEFAULT_WEIGHT: 1.0,
  PASSING_PERCENTAGE: 70, // 70% to pass
};
