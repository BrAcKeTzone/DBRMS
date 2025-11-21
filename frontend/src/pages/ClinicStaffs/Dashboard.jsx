import React from "react";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const ClinicStaffDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Clinic Staff Dashboard
        </h1>
        <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8a5 5 0 015-5h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No data to display
          </h2>
          <p className="text-gray-500 mb-6">
            This ClinicStaff dashboard has been simplified for the demo. Core
            features such as scheduling, scoring, and reporting are hidden.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/clinic-staffs/users")}
              variant="outline"
            >
              User Management
            </Button>
            <Button onClick={() => navigate("/")} variant="primary">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicStaffDashboard;
