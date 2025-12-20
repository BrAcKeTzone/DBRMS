import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";

const SigninForm = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      const { user } = await login(formData);
      // Navigate to appropriate dashboard based on user role
      if (user?.role === "CLINIC_ADMIN" || user?.role === "CLINIC_STAFF") {
        navigate("/clinic/dashboard");
      } else if (user?.role === "PARENT_GUARDIAN") {
        navigate("/parent/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      // Error is handled by the store
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-50 shadow-md rounded-lg p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            BCFI Clinic Management
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />

            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading || !formData.email || !formData.password}
          >
            {loading ? <LoadingSpinner size="sm" /> : "Login"}
          </Button>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register here
              </Link>
            </span>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p className="font-medium mb-2">Demo accounts (use to sign in):</p>
            <ul className="text-left text-xs space-y-1">
              <li>
                <strong>Clinic Admin:</strong> admin@demo / password123
              </li>
              <li>
                <strong>Clinic Staff:</strong> staff@demo / staff123
              </li>
              <li>
                <strong>Parent:</strong> parent@demo / parent123
              </li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SigninForm;
