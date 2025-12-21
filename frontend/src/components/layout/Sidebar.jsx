import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, isHROrAdmin } = useAuthStore();

  // Consider the route active if pathname equals the path or starts with it
  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const getMenuItemColors = (index, isActive) => {
    const colorSchemes = [
      {
        active:
          "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-md",
        inactive: "text-blue-700 hover:bg-blue-100 hover:text-blue-800",
      },
      {
        active:
          "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-md",
        inactive: "text-blue-700 hover:bg-blue-100 hover:text-blue-800",
      },
      {
        active:
          "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-md",
        inactive: "text-blue-700 hover:bg-blue-100 hover:text-blue-800",
      },
      {
        active:
          "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-md",
        inactive: "text-blue-700 hover:bg-blue-100 hover:text-blue-800",
      },
      {
        active:
          "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-md",
        inactive: "text-blue-700 hover:bg-blue-100 hover:text-blue-800",
      },
      {
        active:
          "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-md",
        inactive: "text-blue-700 hover:bg-blue-100 hover:text-blue-800",
      },
      {
        active:
          "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-md",
        inactive: "text-blue-700 hover:bg-blue-100 hover:text-blue-800",
      },
      {
        active:
          "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-md",
        inactive: "text-blue-700 hover:bg-blue-100 hover:text-blue-800",
      },
      {
        active:
          "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-md",
        inactive: "text-blue-700 hover:bg-blue-100 hover:text-blue-800",
      },
      {
        active:
          "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-md",
        inactive: "text-blue-700 hover:bg-blue-100 hover:text-blue-800",
      },
    ];

    const colorScheme = colorSchemes[index % colorSchemes.length];
    return isActive ? colorScheme.active : colorScheme.inactive;
  };

  const getMenuItemIconColor = (index, isActive) => {
    const iconColors = [
      isActive ? "text-blue-800" : "text-blue-600 group-hover:text-blue-700",
      isActive ? "text-blue-800" : "text-blue-600 group-hover:text-blue-700",
      isActive ? "text-blue-800" : "text-blue-600 group-hover:text-blue-700",
      isActive ? "text-blue-800" : "text-blue-600 group-hover:text-blue-700",
      isActive ? "text-blue-800" : "text-blue-600 group-hover:text-blue-700",
      isActive ? "text-blue-800" : "text-blue-600 group-hover:text-blue-700",
      isActive ? "text-blue-800" : "text-blue-600 group-hover:text-blue-700",
      isActive ? "text-blue-800" : "text-blue-600 group-hover:text-blue-700",
      isActive ? "text-blue-800" : "text-blue-600 group-hover:text-blue-700",
      isActive ? "text-blue-800" : "text-blue-600 group-hover:text-blue-700",
    ];

    return iconColors[index % iconColors.length];
  };

  const getNavigationItems = () => {
    // Clinic staff (admins/staff) have access to clinic routes
    if (isHROrAdmin()) {
      return [
        {
          name: "Dashboard",
          path: "/clinic/dashboard",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
          ),
        },
        {
          name: "System Config",
          path: "/clinic/system-configuration",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3"
              />
            </svg>
          ),
        },
        {
          name: "Health Records",
          path: "/clinic/health-records",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
          ),
        },
        {
          name: "Visit Logging",
          path: "/clinic/visit-logging",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3"
              />
            </svg>
          ),
        },
        {
          name: "Students",
          path: "/clinic/students",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"
              />
            </svg>
          ),
        },
        {
          name: "Users",
          path: "/clinic/users",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"
              />
            </svg>
          ),
        },
        {
          name: "Profile",
          path: "/clinic/profile",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM6 20v-1a6 6 0 0112 0v1"
              />
            </svg>
          ),
        },
      ];
    } else if (user?.role === "PARENT_GUARDIAN") {
      return [
        {
          name: "Dashboard",
          path: "/parent/dashboard",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
          ),
        },
        {
          name: "Linked Students",
          path: "/parent/linked-students",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"
              />
            </svg>
          ),
        },
        {
          name: "Health Records",
          path: "/parent/health-records",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
          ),
        },
        {
          name: "SMS Tracking",
          path: "/parent/sms-tracking",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3"
              />
            </svg>
          ),
        },
        {
          name: "Profile",
          path: "/parent/profile",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM6 20v-1a6 6 0 0112 0v1"
              />
            </svg>
          ),
        },
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-30 bg-blue-900/20 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-50 to-blue-50 h-full shadow-lg border-r border-blue-200 transform transition-transform duration-300 ease-in-out lg:sticky lg:top-16 lg:z-10 lg:translate-x-0 lg:h-auto lg:overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        <div className="p-6 border-b border-blue-200 bg-gradient-to-r from-blue-100 to-blue-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-blue-800">
                Navigation
              </h2>
              <p className="text-xs text-blue-600 mt-1 font-medium">
                {isHROrAdmin() ? "Clinic Panel" : "Parent Portal"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-blue-500 hover:text-blue-700 transition-colors"
              aria-label="Close sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item, index) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105
                    ${getMenuItemColors(index, active)}
                  `}
                >
                  <span
                    className={`mr-3 transition-colors duration-200 ${getMenuItemIconColor(
                      index,
                      active
                    )}`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-semibold">{item.name}</span>
                  {active && (
                    <span className="ml-auto">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
