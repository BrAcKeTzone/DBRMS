import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import DashboardCard from "../components/DashboardCard";
import Button from "../components/Button";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import OTPInput from "../components/OTPInput";
import Modal from "../components/Modal";
import { formatDate } from "../utils/formatDate";

const ProfilePage = () => {
  const {
    user,
    updateProfile,
    getProfile,
    changePasswordWithOtp,
    sendOtpForPasswordChange,
    loading,
    error,
    clearError,
  } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordStep, setPasswordStep] = useState(1); // 1: Send OTP, 2: Verify OTP & Change Password
  const [otpSent, setOtpSent] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  useEffect(() => {
    // Fetch latest profile data when component mounts
    const refreshProfile = async () => {
      try {
        await getProfile();
      } catch (error) {
        console.error("Failed to refresh profile:", error);
        // Don't redirect on profile fetch errors, just log them
      }
    };

    if (user) {
      refreshProfile();
    }
  }, [getProfile]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "CLINIC_STAFF":
        return "Clinic Staff";
      case "GUARDIAN":
        return "Guardian";
      default:
        return role;
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    clearError(); // Clear any existing errors

    // Basic validation
    if (!profileData.firstName.trim()) {
      return;
    }

    if (!profileData.lastName.trim()) {
      return;
    }

    if (!profileData.email.trim()) {
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      return;
    }

    try {
      await updateProfile(profileData);
      setIsEditing(false);
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Error is already handled in the store and displayed via the error state
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordData.currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    try {
      await sendOtpForPasswordChange(passwordData.currentPassword);
      setPasswordStep(2);
      setOtpSent(true);
    } catch (error) {
      setPasswordError(error.message || "Failed to send OTP");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (!passwordData.otp) {
      setPasswordError("Please enter the OTP code");
      return;
    }

    try {
      await changePasswordWithOtp(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.otp
      );
      setPasswordSuccess("Password changed successfully!");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          otp: "",
        });
        setPasswordStep(1);
        setOtpSent(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (error) {
      setPasswordError(error.message || "Failed to change password");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset profile data to original values
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account information and security settings.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Success Display */}
      {profileSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {profileSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <DashboardCard title="Personal Information" className="h-fit">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      firstName: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  required
                  placeholder="Enter your first name"
                />

                <Input
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      lastName: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  required
                  placeholder="Enter your last name"
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                disabled={true}
                required
              />

              <Input
                label="Phone Number"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    phone: e.target.value,
                  })
                }
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="contents">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    setIsEditing(true);
                    clearError(); // Clear any existing errors when starting to edit
                  }}
                  className="w-full sm:w-auto"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Account Summary & Security */}
        <div className="space-y-6">
          {/* Account Summary */}
          <DashboardCard title="Account Summary">
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                    user?.role === "CLINIC_STAFF"
                      ? "bg-blue-600"
                      : "bg-green-600"
                  }`}
                >
                  {user?.firstName && user?.lastName
                    ? `${user.firstName.charAt(0).toUpperCase()}${user.lastName
                        .charAt(0)
                        .toUpperCase()}`
                    : "U"}
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500 break-all">{user?.email}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                    user?.role === "CLINIC_STAFF"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className="font-medium">#{user?.id}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Member since:</span>
                    <span className="font-medium">
                      {formatDate(user?.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last updated:</span>
                    <span className="font-medium">
                      {formatDate(user?.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Security Settings */}
          <DashboardCard title="Security Settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-gray-600">
                    Last changed:{" "}
                    {formatDate(user?.passwordChangedAt || user?.createdAt)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change
                </Button>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError("");
          setPasswordSuccess("");
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            otp: "",
          });
          setPasswordStep(1);
          setOtpSent(false);
        }}
        title={
          passwordStep === 1
            ? "Change Password - Verify Identity"
            : "Change Password - Set New Password"
        }
      >
        {passwordStep === 1 ? (
          // Step 1: Enter current password and send OTP
          <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-6">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {passwordError}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
              <p className="text-sm">
                For security, we'll send an OTP to your email to verify the
                password change.
              </p>
            </div>

            <PasswordInput
              label="Current Password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              required
              placeholder="Enter your current password"
            />

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                    otp: "",
                  });
                  setPasswordStep(1);
                  setOtpSent(false);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </div>
          </form>
        ) : (
          // Step 2: Enter OTP and new password
          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-4 sm:space-y-6"
          >
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {passwordSuccess}
              </div>
            )}

            {otpSent && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <p className="text-sm">
                  OTP has been sent to your email ({user?.email}). Please check
                  your inbox.
                </p>
              </div>
            )}

            <OTPInput
              label="Enter OTP Code"
              value={passwordData.otp}
              onChange={(otp) =>
                setPasswordData({
                  ...passwordData,
                  otp: otp,
                })
              }
              length={6}
            />

            <PasswordInput
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              required
              placeholder="Enter new password (minimum 6 characters)"
            />

            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              required
              placeholder="Re-enter your new password"
            />

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPasswordStep(1);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setOtpSent(false);
                }}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;
