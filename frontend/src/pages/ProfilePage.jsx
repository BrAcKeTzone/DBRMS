import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import DashboardCard from "../components/dashboard/DashboardCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import Modal from "../components/ui/Modal";
import { formatDate } from "../utils/formatDate";
import { capitalizeWords } from "../utils/helpers";

const ProfilePage = () => {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  // Actions (stable selectors)
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const getProfile = useAuthStore((s) => s.getProfile);
  const changePasswordWithOtp = useAuthStore((s) => s.changePasswordWithOtp);
  const sendOtpForPasswordChange = useAuthStore(
    (s) => s.sendOtpForPasswordChange,
  );
  const uploadProfilePicture = useAuthStore((s) => s.uploadProfilePicture);
  const clearError = useAuthStore((s) => s.clearError);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const middleNameRef = useRef(null);
  const phoneRef = useRef(null);
  const caretSelection = useRef({});

  const handleFirstNameChange = React.useCallback((e) => {
    const value = capitalizeWords(e.target.value);
    caretSelection.current.firstName = {
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    };
    setProfileData((prev) => ({ ...prev, firstName: value }));
    setValidationErrors((prev) => {
      if (prev.firstName) {
        const { firstName, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  const handleLastNameChange = React.useCallback((e) => {
    const value = capitalizeWords(e.target.value);
    caretSelection.current.lastName = {
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    };
    setProfileData((prev) => ({ ...prev, lastName: value }));
    setValidationErrors((prev) => {
      if (prev.lastName) {
        const { lastName, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  const handleMiddleNameChange = React.useCallback((e) => {
    const value = capitalizeWords(e.target.value);
    caretSelection.current.middleName = {
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    };
    setProfileData((prev) => ({ ...prev, middleName: value }));
  }, []);

  const handlePhoneChange = React.useCallback((e) => {
    const value = e.target.value;
    caretSelection.current.phone = {
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    };
    setProfileData((prev) => ({ ...prev, phone: value }));
    setValidationErrors((prev) => {
      if (prev.phone) {
        const { phone, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

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
  const [validationErrors, setValidationErrors] = useState({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Use a ref to prevent infinite refresh loops
  const hasInitialRefreshRun = useRef(false);

  useEffect(() => {
    // Only fetch profile data once when user is available
    const refreshProfile = async () => {
      if (hasInitialRefreshRun.current) return;
      hasInitialRefreshRun.current = true;

      try {
        await getProfile();
      } catch (error) {
        console.error("Failed to refresh profile:", error);

        // Check if it's a 401 error (authentication failure)
        if (error.response?.status === 401) {
          console.error(
            "Authentication failed, user will be redirected to login",
          );
          return;
        }
      }
    };

    if (user) {
      refreshProfile();
    }

    // Cleanup function to clear errors when component unmounts
    return () => {
      clearError();
    };
  }, [user, getProfile, clearError]);

  // Sync profileData from user only when not currently editing.
  // This prevents user store updates (e.g. profile picture, other actions)
  // from overwriting the values while the user is typing in edit mode.
  useEffect(() => {
    if (user && !isEditing) {
      setProfileData({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      // Clear any validation errors when user data changes
      setValidationErrors({});
    }
  }, [user, isEditing]);

  // Restore caret positions after state updates to avoid losing caret while typing.
  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        if (
          document.activeElement === firstNameRef.current &&
          caretSelection.current.firstName
        ) {
          const { start, end } = caretSelection.current.firstName;
          firstNameRef.current.setSelectionRange(start, end);
        }
      } catch (err) {
        // ignore
      }

      try {
        if (
          document.activeElement === lastNameRef.current &&
          caretSelection.current.lastName
        ) {
          const { start, end } = caretSelection.current.lastName;
          lastNameRef.current.setSelectionRange(start, end);
        }
      } catch (err) {
        // ignore
      }

      try {
        if (
          document.activeElement === middleNameRef.current &&
          caretSelection.current.middleName
        ) {
          const { start, end } = caretSelection.current.middleName;
          middleNameRef.current.setSelectionRange(start, end);
        }
      } catch (err) {
        // ignore
      }

      try {
        if (
          document.activeElement === phoneRef.current &&
          caretSelection.current.phone
        ) {
          const { start, end } = caretSelection.current.phone;
          phoneRef.current.setSelectionRange(start, end);
        }
      } catch (err) {
        // ignore
      }
    });
  }, [
    profileData.firstName,
    profileData.lastName,
    profileData.middleName,
    profileData.phone,
  ]);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "CLINIC_STAFF":
        return "Clinic Staff";
      case "PARENT_GUARDIAN":
        return "Parent/Guardian";
      default:
        return role?.replace("_", " ").toLowerCase();
    }
  };

  const handleProfilePictureSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Read and preview the image
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result;
      setProfilePicturePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfilePicture = async () => {
    if (!profilePicturePreview) {
      alert("Please select an image first");
      return;
    }

    setIsUploadingPicture(true);
    try {
      // Use auth store action to upload and update user state
      const response = await uploadProfilePicture(profilePicturePreview);

      if (response?.user) {
        setProfilePicturePreview(null);
        setShowProfilePictureModal(false);
        setProfileSuccess("Profile picture updated successfully!");
        setTimeout(() => setProfileSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleCancelProfilePictureUpload = () => {
    setProfilePicturePreview(null);
    setShowProfilePictureModal(false);
  };

  const validateProfileForm = (values = profileData) => {
    const errors = {};

    // First name validation
    if (!values.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (profileData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters long";
    }

    // Last name validation
    if (!values.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (profileData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters long";
    }

    // Phone validation
    if (!values.phone || !values.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    // Email validation
    if (!values.email.trim()) {
      errors.email = "Email address is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(values.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    return errors;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setValidationErrors({});
    clearError(); // Clear any existing errors

    // Validate form
    const errors = validateProfileForm(profileData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsUpdatingProfile(true); // Set local loading state
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);

      // Handle 401 authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed during profile update");
        // The fetchClient interceptor will handle the redirect
        return;
      }

      // Error is already handled in the store and displayed via the error state
    } finally {
      setIsUpdatingProfile(false); // Clear local loading state
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordData.currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    setIsPasswordLoading(true);
    try {
      await sendOtpForPasswordChange(passwordData.currentPassword);
      setPasswordStep(2);
      setOtpSent(true);
    } catch (error) {
      // Handle 401 authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed during OTP send");
        // The fetchClient interceptor will handle the redirect
        return;
      }

      setPasswordError(error.message || "Failed to send OTP");
    } finally {
      setIsPasswordLoading(false);
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

    setIsPasswordLoading(true);
    try {
      await changePasswordWithOtp(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.otp,
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
        setIsPasswordLoading(false);
      }, 2000);
    } catch (error) {
      // Handle 401 authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed during password change");
        // The fetchClient interceptor will handle the redirect
        return;
      }

      setPasswordError(error.message || "Failed to change password");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setValidationErrors({});
    setProfileSuccess("");
    setIsUpdatingProfile(false); // Reset local loading state
    clearError();
    // Reset profile data to original values
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  };

  // Show loading state if no user data is available yet
  if (!user && loading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no user data and not loading
  if (!user && !loading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Unable to load profile data.</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                <div>
                  <Input
                    ref={firstNameRef}
                    label="First Name"
                    value={profileData.firstName}
                    onChange={handleFirstNameChange}
                    disabled={!isEditing}
                    required
                    placeholder="Enter your first name"
                    className={`input-field ${
                      !isEditing ? "bg-gray-100" : "bg-white"
                    }`}
                  />
                  {validationErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    ref={lastNameRef}
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={handleLastNameChange}
                    disabled={!isEditing}
                    required
                    placeholder="Enter your last name"
                    className={`input-field ${
                      !isEditing ? "bg-gray-100" : "bg-white"
                    }`}
                  />
                  {validationErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Input
                  ref={middleNameRef}
                  label="Middle Name (Optional)"
                  value={profileData.middleName}
                  onChange={handleMiddleNameChange}
                  disabled={!isEditing}
                  placeholder="Enter your middle name"
                  className={`input-field ${
                    !isEditing ? "bg-gray-100" : "bg-white"
                  }`}
                />
              </div>

              <div>
                <Input
                  ref={phoneRef}
                  label="Phone Number"
                  value={profileData.phone}
                  onChange={handlePhoneChange}
                  disabled={!isEditing}
                  required
                  placeholder="Enter your phone number"
                  className={`input-field ${
                    !isEditing ? "bg-gray-100" : "bg-white"
                  }`}
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => {
                    setProfileData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }));
                    // Clear validation error when user starts typing
                    if (validationErrors.email) {
                      const { email, ...rest } = validationErrors;
                      setValidationErrors(rest);
                    }
                  }}
                  disabled={true}
                  required
                  className="input-field bg-gray-100"
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="contents">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={
                      isUpdatingProfile ||
                      Object.keys(validationErrors).length > 0
                    }
                    className="w-full sm:w-auto"
                  >
                    {isUpdatingProfile ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
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
                {user?.profilePicture ? (
                  <div className="relative">
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-blue-600"
                    />
                    <button
                      onClick={() => setShowProfilePictureModal(true)}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
                      title="Change profile picture"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowProfilePictureModal(true)}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl hover:opacity-80 transition-all ${
                      user?.role === "HR" ? "bg-blue-600" : "bg-green-600"
                    }`}
                    title="Add profile picture"
                  >
                    <div className="text-center">
                      <div className="text-sm">
                        {user?.firstName && user?.lastName
                          ? (
                              user.firstName.charAt(0) + user.lastName.charAt(0)
                            ).toUpperCase()
                          : "U"}
                      </div>
                      <div className="text-xs">+</div>
                    </div>
                  </button>
                )}
              </div>

              <div className="text-center">
                <h3 className="font-medium text-gray-900">
                  {[user?.firstName, user?.middleName, user?.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </h3>
                <p className="text-sm text-gray-500 break-all">{user?.email}</p>
                {user?.phone && (
                  <p className="text-sm text-gray-500 mt-1">{user.phone}</p>
                )}
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                    user?.role === "HR"
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
                disabled={
                  isPasswordLoading || !passwordData.currentPassword.trim()
                }
                className="w-full sm:w-auto"
              >
                {isPasswordLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending OTP...
                  </div>
                ) : (
                  "Send OTP"
                )}
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

            <Input
              label="Enter OTP Code"
              name="otp"
              type="text"
              value={passwordData.otp}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  otp: e.target.value,
                })
              }
              required
              placeholder="Enter 6-digit OTP"
              maxLength={6}
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
                disabled={
                  isPasswordLoading ||
                  !passwordData.otp.trim() ||
                  !passwordData.newPassword.trim() ||
                  !passwordData.confirmPassword.trim()
                }
                className="w-full sm:w-auto"
              >
                {isPasswordLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Changing...
                  </div>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Profile Picture Upload Modal */}
      <Modal
        isOpen={showProfilePictureModal}
        onClose={handleCancelProfilePictureUpload}
        title="Update Profile Picture"
      >
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="flex justify-center">
            {profilePicturePreview ? (
              <div className="relative">
                <img
                  src={profilePicturePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-blue-600"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-xs text-gray-500">No image selected</p>
                </div>
              </div>
            )}
          </div>

          {/* File Input */}
          <div>
            <label
              htmlFor="profile-image"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Image
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureSelect}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              disabled={isUploadingPicture}
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
            </p>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
            <p>
              You can upload a photo to personalize your profile. Click the
              button to select an image from your device.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelProfilePictureUpload}
              className="w-full sm:w-auto"
              disabled={isUploadingPicture}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveProfilePicture}
              disabled={!profilePicturePreview || isUploadingPicture}
              className="w-full sm:w-auto"
            >
              {isUploadingPicture ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                "Save Picture"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
