import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";

const SignupForm = () => {
  console.debug("SignupForm render");

  const navigate = useNavigate();
  const signupPhase = useAuthStore((s) => s.signupPhase);
  const generatedOtp = useAuthStore((s) => s.generatedOtp);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  // Actions (stable selectors)
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const completeRegistration = useAuthStore((s) => s.completeRegistration);
  const resetSignup = useAuthStore((s) => s.resetSignup);
  const clearError = useAuthStore((s) => s.clearError);
  const rawSignupData = useAuthStore((s) => s.signupData);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

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

  const validatePersonalDetails = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?\d{7,15}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhase1Submit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      await sendOtp(formData.email);
      // OTP will be sent to the user's email
    } catch (err) {
      console.error("Failed to send OTP:", err);
    }
  };

  const handlePhase2Submit = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    try {
      await verifyOtp(formData.otp);
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  const handlePhase3Submit = async (e) => {
    e.preventDefault();
    if (!validatePersonalDetails()) return;

    try {
      await completeRegistration({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        phone: formData.phone,
        password: formData.password,
      });
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const handleStartOver = () => {
    resetSignup();
    setFormData({
      email: "",
      otp: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setValidationErrors({});
  };

  const renderPhase1 = () => (
    <form onSubmit={handlePhase1Submit} className="mt-8 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Step 1 of 3: Enter your email
        </h3>
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
        {loading ? <LoadingSpinner size="sm" /> : "Send OTP"}
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
          We've sent a 6-digit code to <strong>{formData.email}</strong>. Please
          check your email and enter the code below.
        </p>
        {generatedOtp && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
            <p className="text-sm">
              <strong>Demo OTP:</strong> {generatedOtp}
            </p>
          </div>
        )}
        <Input
          label="Enter OTP"
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
          {loading ? <LoadingSpinner size="sm" /> : "Verify OTP"}
        </Button>
      </div>
    </form>
  );

  const renderPhase3 = () => (
    <form onSubmit={handlePhase3Submit} className="mt-8 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Step 3 of 3: Complete your profile
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="First Name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter your first name"
              />
              {validationErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.firstName}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Last Name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter your last name"
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
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="e.g. +632912345678"
            />
            {validationErrors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.phone}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Middle Name (Optional)"
              name="middleName"
              type="text"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Enter your middle name"
            />
          </div>

          <div>
            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimum 6 characters"
              error={validationErrors.password}
            />
          </div>

          <div>
            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your password"
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
          {loading ? <LoadingSpinner size="sm" /> : "Create Account"}
        </Button>
      </div>
    </form>
  );

  const renderPhase4 = () => (
    <div className="mt-8 text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-sky-100">
        <svg
          className="h-8 w-8 text-sky-600"
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
          Congratulations!
        </h3>
        <p className="text-gray-600 mb-1">
          Your account has been created successfully.
        </p>
        <p className="text-sm text-gray-500">
          Welcome to BCFI Clinic Management,{" "}
          {rawSignupData?.firstName || formData.firstName}{" "}
          {rawSignupData?.lastName || formData.lastName}!
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => navigate("/signin")}
        >
          Login Now
        </Button>

        <Button variant="outline" className="w-full" onClick={handleStartOver}>
          Create Another Account
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-0 sm:py-12 px-0 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-50 shadow-md rounded-none sm:rounded-lg p-6 sm:p-8 mx-0 sm:mx-auto min-h-screen sm:min-h-0 flex flex-col justify-center overflow-auto">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Register to the BCFI Clinic
          </p>
        </div>

        {/* Progress Indicator */}
        {signupPhase < 4 && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= signupPhase
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-1 ${
                        step < signupPhase ? "bg-blue-600" : "bg-gray-200"
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

        {signupPhase === 1 && renderPhase1()}
        {signupPhase === 2 && renderPhase2()}
        {signupPhase === 3 && renderPhase3()}
        {signupPhase === 4 && renderPhase4()}

        {signupPhase < 4 && (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Login here
              </Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupForm;
