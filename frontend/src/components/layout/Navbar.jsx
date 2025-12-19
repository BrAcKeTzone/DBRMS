import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "ADMIN":
        return "PTA Administrator";
      case "PARENT":
        return "Parent Member";
      case "HR":
        return "HR Manager";
      case "APPLICANT":
        return "Applicant";
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-green-100 text-green-800";
      case "PARENT":
        return "bg-emerald-100 text-emerald-800";
      case "HR":
        return "bg-teal-100 text-teal-800";
      case "APPLICANT":
        return "bg-lime-100 text-lime-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUserInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return "U";
    const initials = [];
    if (firstName) initials.push(firstName.charAt(0).toUpperCase());
    if (lastName) initials.push(lastName.charAt(0).toUpperCase());
    return initials.join("");
  };

  const getFullName = () => {
    const parts = [];
    if (user?.firstName) parts.push(user.firstName);
    if (user?.middleName) parts.push(user.middleName);
    if (user?.lastName) parts.push(user.lastName);
    return parts.join(" ");
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-green-50 to-emerald-100 shadow-lg border-b border-green-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Hamburger Menu for mobile */}
            {isAuthenticated && (
              <div className="lg:hidden mr-2">
                <button
                  onClick={onMenuClick}
                  className="inline-flex items-center justify-center p-2 rounded-md text-green-600 hover:text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
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
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-green-700">PTA</h1>
              </div>
              <div className="hidden md:block ml-2">
                <span className="text-green-600 text-sm font-medium">
                  JHCSC Dumingag Campus
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation items */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="hidden md:flex flex-col items-end mr-3">
                <span className="text-sm font-medium text-green-800">
                  {getFullName()}
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
                <span className="text-xs text-green-600">{user?.email}</span>
              </div>

              {/* User avatar */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`w-10 h-10 rounded-full text-white font-medium text-sm hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 overflow-hidden ${
                    !user?.profilePicture &&
                    (user?.role === "ADMIN"
                      ? "bg-green-600 hover:bg-green-700"
                      : user?.role === "PARENT"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : user?.role === "HR"
                      ? "bg-teal-600 hover:bg-teal-700"
                      : "bg-lime-600 hover:bg-lime-700")
                  }`}
                  title={`${getFullName()} (${getRoleDisplayName(user?.role)})`}
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      {getUserInitials(user?.firstName, user?.lastName)}
                    </div>
                  )}
                </button>
                {/* Online status indicator */}
                <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                      {user?.profilePicture && (
                        <div className="mb-3 flex justify-center">
                          <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover border-2 border-green-600"
                          />
                        </div>
                      )}
                      <div className="font-medium text-gray-900 mb-1">
                        {getFullName()}
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
                      </div>
                      {user?.id && (
                        <div className="text-xs text-gray-400 mt-2">
                          ID: {user.id}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-400">
                          {currentTime.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                          <span className="text-xs text-green-600">Online</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={
                        user?.role === "ADMIN"
                          ? "/admin/dashboard"
                          : user?.role === "PARENT"
                          ? "/parent/dashboard"
                          : user?.role === "HR"
                          ? "/hr/dashboard"
                          : "/applicant/dashboard"
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>

                    <Link
                      to={
                        user?.role === "ADMIN"
                          ? "/admin/profile"
                          : user?.role === "PARENT"
                          ? "/parent/profile"
                          : user?.role === "HR"
                          ? "/hr/profile"
                          : "/applicant/profile"
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>

                    <hr className="border-gray-200" />

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
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
    </nav>
  );
};

export default Navbar;
