import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const {
    forgotPasswordPhase,
    forgotPasswordData,
    forgotPasswordOtp,
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword,
    resetForgotPassword,
    loading,
    error,
    clearError,
  } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Reset forgot password process when component mounts
  useEffect(() => {
    resetForgotPassword();
  }, [resetForgotPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (error) clearError();
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEmail = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOtp = () => {
    const errors = {};
    if (!formData.otp.trim()) {
      errors.otp = "OTP is required";
    } else if (formData.otp.length !== 6) {
      errors.otp = "OTP must be 6 digits";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswords = () => {
    const errors = {};

    if (!formData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhase1Submit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      const result = await sendPasswordResetOtp(formData.email);
      // OTP will be sent to the user's email
    } catch (err) {
      console.error("Failed to send password reset OTP:", err);
    }
  };

  const handlePhase2Submit = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    try {
      await verifyPasswordResetOtp(formData.otp);
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  const handlePhase3Submit = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    try {
      await resetPassword({
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
    } catch (err) {
      console.error("Password reset failed:", err);
    }
  };

  const handleStartOver = () => {
    resetForgotPassword();
    setFormData({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setValidationErrors({});
  };

  const renderPhase1 = () => (
    <form onSubmit={handlePhase1Submit} className="mt-8 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Step 1 of 3: Enter your email address
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We'll send you a verification code to reset your password.
        </p>
        <Input
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email address"
        />
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={loading}
      >
        {loading ? <LoadingSpinner size="sm" /> : "Send Reset Code"}
      </Button>
    </form>
  );

  const renderPhase2 = () => (
    <form onSubmit={handlePhase2Submit} className="mt-8 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Step 2 of 3: Verify your email
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We've sent a 6-digit code to{" "}
          <strong>{forgotPasswordData.email}</strong>
        </p>
        {forgotPasswordOtp && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
            <p className="text-sm">
              <strong>Demo OTP:</strong> {forgotPasswordOtp}
            </p>
          </div>
        )}
        <Input
          label="Enter verification code"
          name="otp"
          type="text"
          value={formData.otp}
          onChange={handleChange}
          required
          placeholder="Enter 6-digit code"
          maxLength={6}
        />
        {validationErrors.otp && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.otp}</p>
        )}
      </div>

      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleStartOver}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : "Verify Code"}
        </Button>
      </div>
    </form>
  );

  const renderPhase3 = () => (
    <form onSubmit={handlePhase3Submit} className="mt-8 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Step 3 of 3: Set new password
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose a strong password for your account.
        </p>

        <div className="space-y-4">
          <div>
            <PasswordInput
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Enter new password (minimum 6 characters)"
              error={validationErrors.newPassword}
            />
          </div>

          <div>
            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your new password"
              error={validationErrors.confirmPassword}
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleStartOver}
        >
          Start Over
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : "Reset Password"}
        </Button>
      </div>
    </form>
  );

  const renderPhase4 = () => (
    <div className="mt-8 text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Password Reset Successful!
        </h3>
        <p className="text-gray-600 mb-1">
          Your password has been changed successfully.
        </p>
        <p className="text-sm text-gray-500">
          You can now sign in with your new password.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => navigate("/signin")}
        >
          Sign In Now
        </Button>

        <Button variant="outline" className="w-full" onClick={handleStartOver}>
          Reset Another Password
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-transparent shadow-md rounded-lg p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            BCFI HR Application System
          </p>
        </div>

        {/* Progress Indicator */}
        {forgotPasswordPhase < 4 && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= forgotPasswordPhase
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-1 ${
                        step < forgotPasswordPhase
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {forgotPasswordPhase === 1 && renderPhase1()}
        {forgotPasswordPhase === 2 && renderPhase2()}
        {forgotPasswordPhase === 3 && renderPhase3()}
        {forgotPasswordPhase === 4 && renderPhase4()}

        {forgotPasswordPhase < 4 && (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                to="/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
