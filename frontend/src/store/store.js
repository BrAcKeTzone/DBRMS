// PTA Management System - Zustand Stores
// Central store exports for the PTA Management System

// Authentication and user management
export { useAuthStore } from "./authStore";
export { useUserManagementStore } from "./userManagementStore";

// Legacy HR system stores (keep for reference during migration)
export { useApplicationStore } from "./applicationStore";
export { useReportStore } from "./reportStore";
export { useScheduleStore } from "./scheduleStore";
export { useScoringStore } from "./scoringStore";

// PTA Management System stores
export { useAttendanceStore } from "./attendanceStore";
export { useContributionsStore } from "./contributionsStore";
export { useProjectsStore } from "./projectsStore";
export { useAnnouncementsStore } from "./announcementsStore";
export { useClearanceStore } from "./clearanceStore";
export { useStudentsStore } from "./studentsStore";
export { useSettingsStore } from "./settingsStore";

// Redux Toolkit store removed — migrated to Zustand.
// The application now uses Zustand stores exported above.
// If you need to revert, reintroduce `configureStore` and the reducers.

// NOTE: No Redux store is exported anymore.
