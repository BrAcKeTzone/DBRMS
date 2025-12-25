import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Auth pages
import SigninPage from "../pages/Auth/SigninPage";
import SignupPage from "../pages/Auth/SignupPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";

// ClinicStaff pages
import AdminDashboard from "../pages/ClinicStaff/AdminDashboard";
import SystemConfiguration from "../pages/ClinicStaff/SystemConfiguration";
import HealthRecordManagement from "../pages/ClinicStaff/HealthRecordManagement";
import ClinicVisitLogging from "../pages/ClinicStaff/ClinicVisitLogging";
import Students from "../pages/ClinicStaff/Students";
import StudentLinks from "../pages/ClinicStaff/StudentLinks";
import Users from "../pages/ClinicStaff/Users";

// Parent pages
import PGDashboard from "../pages/ParentGuardian/PGDashboard";
import HealthRecordViewing from "../pages/ParentGuardian/HealthRecordViewing";
import MyChildren from "../pages/ParentGuardian/MyChildren";
import SMSNotificationsTracking from "../pages/ParentGuardian/SMSNotificationsTracking";

// Shared pages
import ProfilePage from "../pages/ProfilePage";

// Layout components
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// Simple protected route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // select only what's needed to reduce re-renders
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  // If we are loading, show nothing or a spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If authenticated but user data is missing, we might be in a transition state
  // or rehydration hasn't finished. If loading is false, this is an error state.
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Ensure user has a role before checking
  const userRole = user?.role;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // redirect to appropriate dashboard based on role
    if (userRole === "CLINIC_ADMIN" || userRole === "CLINIC_STAFF") {
      return <Navigate to="/clinic/dashboard" replace />;
    }
    if (userRole === "PARENT_GUARDIAN") {
      return <Navigate to="/parent/dashboard" replace />;
    }
    return <Navigate to="/signin" replace />;
  }

  return children;
};

// PublicRoute to redirect authenticated users
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  // If loading, wait before redirecting
  if (loading) {
    return children;
  }

  if (isAuthenticated && user && user.role) {
    const userRole = user.role;
    if (userRole === "CLINIC_ADMIN" || userRole === "CLINIC_STAFF") {
      return <Navigate to="/clinic/dashboard" replace />;
    }
    if (userRole === "PARENT_GUARDIAN") {
      return <Navigate to="/parent/dashboard" replace />;
    }
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
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route
          path="system-configuration"
          element={
            <ProtectedRoute allowedRoles={["CLINIC_ADMIN"]}>
              <SystemConfiguration />
            </ProtectedRoute>
          }
        />
        <Route path="health-records" element={<HealthRecordManagement />} />
        <Route path="visit-logging" element={<ClinicVisitLogging />} />
        <Route path="students" element={<Students />} />
        <Route path="student-links" element={<StudentLinks />} />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={["CLINIC_ADMIN"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Parent routes */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={["PARENT_GUARDIAN"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PGDashboard />} />
        <Route path="health-records" element={<HealthRecordViewing />} />
        <Route path="linked-students" element={<MyChildren />} />
        <Route path="sms-tracking" element={<SMSNotificationsTracking />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
