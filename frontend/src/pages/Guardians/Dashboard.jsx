import React from "react";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const GuardianDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Guardian Dashboard</h1>
        <p className="text-gray-600">
          Welcome {user?.firstName || "Guardian"}!
        </p>
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
              d="M12 11c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM12 11v8m0 0H9m3 0h3"
            />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No content available
          </h2>
          <p className="text-gray-500 mb-6">
            The Guardian dashboard has been simplified for the demo. You can
            view your profile to manage your information.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/guardians/profile")}
              variant="outline"
            >
              Edit Profile
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

export default GuardianDashboard;
