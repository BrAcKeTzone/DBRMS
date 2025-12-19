import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Auth pages
import SigninPage from "../pages/Auth/SigninPage";
import SignupPage from "../pages/Auth/SignupPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import ProfilePage from "../pages/ProfilePage";

// ClinicStaff pages
import AdminDashboard from "../pages/ClinicStaff/AdminDashboard";
import SystemConfiguration from "../pages/ClinicStaff/SystemConfiguration";
import HealthRecordManagement from "../pages/ClinicStaff/HealthRecordManagement";
import ClinicVisitLogging from "../pages/ClinicStaff/ClinicVisitLogging";

// Parent pages
import PGDashboard from "../pages/ParentGuardian/PGDashboard";
import HealthRecordViewing from "../pages/ParentGuardian/HealthRecordViewing";
import LinkedStudentProfiles from "../pages/ParentGuardian/LinkedStudentProfiles";
import SMSNotificationsTracking from "../pages/ParentGuardian/SMSNotificationsTracking";

// Simple protected route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/signin" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // redirect to appropriate dashboard
    if (user?.role === "CLINIC_ADMIN" || user?.role === "CLINIC_STAFF")
      return <Navigate to="/clinic/dashboard" replace />;
    if (user?.role === "PARENT_GUARDIAN")
      return <Navigate to="/parent/dashboard" replace />;
    return <Navigate to="/signin" replace />;
  }

  return children;
};

// PublicRoute to redirect authenticated users
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    if (user?.role === "CLINIC_ADMIN" || user?.role === "CLINIC_STAFF")
      return <Navigate to="/clinic/dashboard" replace />;
    if (user?.role === "PARENT_GUARDIAN")
      return <Navigate to="/parent/dashboard" replace />;
    return <Navigate to="/clinic/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Navigate to="/signin" replace />
          </PublicRoute>
        }
      />

      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SigninPage />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      {/* Clinic staff routes */}
      <Route
        path="/clinic"
        element={
          <ProtectedRoute allowedRoles={["CLINIC_ADMIN", "CLINIC_STAFF"]}>
            <div />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="system-configuration" element={<SystemConfiguration />} />
        <Route path="health-records" element={<HealthRecordManagement />} />
        <Route path="visit-logging" element={<ClinicVisitLogging />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Parent routes */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={["PARENT_GUARDIAN"]}>
            <div />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PGDashboard />} />
        <Route path="health-records" element={<HealthRecordViewing />} />
        <Route path="linked-students" element={<LinkedStudentProfiles />} />
        <Route path="sms-tracking" element={<SMSNotificationsTracking />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
