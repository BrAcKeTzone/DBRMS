import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Auth pages
import SignupPage from "../pages/SignupPage";
import SigninPage from "../pages/SigninPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

// Guardians pages
import GuardiansDashboard from "../pages/Guardians/Dashboard";

// Clinic Staff pages
import ClinicStaffsDashboard from "../pages/ClinicStaffs/Dashboard";
import ClinicStaffsUserManagement from "../pages/ClinicStaffs/UserManagement";

// Shared pages
import ProfilePage from "../pages/ProfilePage";

// Layout components
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// Dashboard Redirect Component
const DashboardRedirect = () => {
  const { user } = useAuthStore();

  if (user?.role === "CLINIC_STAFF") {
    return <Navigate to="/clinic-staffs/dashboard" replace />;
  } else {
    return <Navigate to="/guardians/dashboard" replace />;
  }
};

// Profile Redirect Component
const ProfileRedirect = () => {
  const { user } = useAuthStore();

  // HR role is not routed to a profile page (profile isn't in the HR sidebar)
  // Send HR users to their dashboard; applicants go to profile.
  if (user?.role === "CLINIC_STAFF") {
    return <Navigate to="/clinic-staffs/dashboard" replace />;
  } else {
    return <Navigate to="/guardians/profile" replace />;
  }
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "CLINIC_STAFF") {
      return <Navigate to="/clinic-staffs/dashboard" replace />;
    } else {
      return <Navigate to="/guardians/dashboard" replace />;
    }
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "CLINIC_STAFF") {
      return <Navigate to="/clinic-staffs/dashboard" replace />;
    } else {
      return <Navigate to="/guardians/dashboard" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Routes>
      {/* Root Route - Redirect to signin for unauthenticated, Dashboard for authenticated */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === "CLINIC_STAFF" ? (
              <Navigate to="/clinic-staffs/dashboard" replace />
            ) : (
              <Navigate to="/guardians/dashboard" replace />
            )
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* Public Routes */}
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
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
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      {/* Guardians Routes */}
      <Route
        path="/guardians"
        element={
          <ProtectedRoute allowedRoles={["GUARDIAN"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<GuardiansDashboard />} />
        {/* HR profile route removed to match navigation */}
      </Route>

      {/* Clinic Staff Routes */}
      <Route
        path="/clinic-staffs"
        element={
          <ProtectedRoute allowedRoles={["CLINIC_STAFF"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ClinicStaffsDashboard />} />
        <Route path="users" element={<ClinicStaffsUserManagement />} />
      </Route>

      {/* Shared Profile Route for direct access - redirect to role-specific profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileRedirect />
          </ProtectedRoute>
        }
      />

      {/* Fallback Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
