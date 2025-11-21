import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Button from "./Button";
import Modal from "./Modal";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      setIsMenuOpen(false);
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "CLINIC_STAFF":
        return "bg-blue-100 text-blue-800";
      case "GUARDIAN":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUserInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return "U";
    return `${firstName.charAt(0).toUpperCase()}${lastName
      .charAt(0)
      .toUpperCase()}`;
  };

  return (
    <nav className="bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-sm border-b border-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Hamburger Menu for mobile */}
            {isAuthenticated && (
              <div className="lg:hidden mr-2">
                <button
                  onClick={onMenuClick}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Logo and brand */}
            <Link to="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <h1 className="text-xl font-bold text-white">BCFI</h1>
              </div>
              <div className="hidden md:block ml-2">
                <span className="text-white text-sm">Clinic DMRMS</span>
              </div>
            </Link>
          </div>

          {/* Navigation items */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="hidden md:flex flex-col items-end mr-3">
                <span className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user?.role
                    )}`}
                  >
                    {getRoleDisplayName(user?.role)}
                  </span>
                </div>
                <span className="text-xs text-white/80">{user?.email}</span>
              </div>

              {/* User avatar */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`w-10 h-10 rounded-full text-white font-medium text-sm hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 transition-all duration-200 ${
                    user?.role === "CLINIC_STAFF"
                      ? "bg-sky-500 hover:bg-sky-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                  title={`${user?.firstName} ${
                    user?.lastName
                  } (${getRoleDisplayName(user?.role)})`}
                >
                  {getUserInitials(user?.firstName, user?.lastName)}
                </button>
                {/* Online status indicator */}
                <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-medium text-gray-900 mb-1">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {user?.email}
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user?.role
                          )}`}
                        >
                          {getRoleDisplayName(user?.role)}
                        </span>
                        {user?.phone && (
                          <span className="text-xs text-gray-400">
                            {user.phone}
                          </span>
                        )}
                      </div>
                      {user?.id && (
                        <div className="text-xs text-gray-400 mt-2">
                          ID: {user.id}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-white/80">
                          {currentTime.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                          <span className="text-xs text-green-600">Online</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-1 py-1">
                      {user?.role === "CLINIC_STAFF" ? (
                        <Link
                          to="/clinic-staffs/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      ) : (
                        <Link
                          to="/guardians/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profile
                        </Link>
                      )}

                      <hr className="border-gray-200" />

                      <button
                        onClick={handleLogoutClick}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/signin">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        title="Confirm Sign Out"
        size="sm"
      >
        <div className="space-y-6">
          <div>
            <p className="text-gray-600">
              Are you sure you want to sign out? You'll need to log in again to
              access your account.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancelLogout}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </Modal>
    </nav>
  );
};

export default Navbar;
