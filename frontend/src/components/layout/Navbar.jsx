import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { fetchClient } from "../../utils/fetchClient";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role !== "PARENT_GUARDIAN") {
      setUnreadCount(0);
      return undefined;
    }

    let active = true;

    const loadUnread = async () => {
      try {
        const resp = await fetchClient.get("/sms/logs/unread-count");
        const data = resp?.data?.data ?? resp?.data ?? resp;
        const count = data?.unread ?? 0;
        if (active) {
          setUnreadCount(count);
        }
      } catch (err) {
        if (active) {
          setUnreadCount(0);
        }
      }
    };

    const handleUnreadUpdate = (event) => {
      if (typeof event.detail === "number") {
        setUnreadCount(event.detail);
      }
    };

    loadUnread();
    window.addEventListener("smsUnreadUpdated", handleUnreadUpdate);

    return () => {
      active = false;
      window.removeEventListener("smsUnreadUpdated", handleUnreadUpdate);
    };
  }, [user]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/signin");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none lg:hidden"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <Link
              to="/"
              className="flex flex-col md:flex-row md:items-center ml-2 lg:ml-0"
            >
              <span className="text-xl font-bold text-blue-600 leading-none">
                BCFI
              </span>
              <span className="text-gray-500 text-[10px] md:text-sm font-medium md:ml-2 leading-none">
                Clinic Management
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {user.role?.replace("_", " ").toLowerCase()}
                  </span>
                </div>
                {user?.role === "PARENT_GUARDIAN" && (
                  <button
                    type="button"
                    onClick={() => navigate("/parent/sms-tracking")}
                    className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md transition-colors"
                    aria-label="View messages"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z"
                      />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )}
                <Link
                  to={
                    user.role === "PARENT_GUARDIAN"
                      ? "/parent/profile"
                      : "/clinic/profile"
                  }
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors overflow-hidden border border-gray-200"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
