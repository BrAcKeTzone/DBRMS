import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getMenuItemColors = (index, isActive) => {
    const colorSchemes = [
      {
        active:
          "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-r-4 border-green-600 shadow-md",
        inactive: "text-green-700 hover:bg-green-100 hover:text-green-800",
      },
      {
        active:
          "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-r-4 border-emerald-600 shadow-md",
        inactive:
          "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800",
      },
      {
        active:
          "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border-r-4 border-teal-600 shadow-md",
        inactive: "text-teal-700 hover:bg-teal-100 hover:text-teal-800",
      },
      {
        active:
          "bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 border-r-4 border-cyan-600 shadow-md",
        inactive: "text-cyan-700 hover:bg-cyan-100 hover:text-cyan-800",
      },
      {
        active:
          "bg-gradient-to-r from-lime-100 to-lime-200 text-lime-800 border-r-4 border-lime-600 shadow-md",
        inactive: "text-lime-700 hover:bg-lime-100 hover:text-lime-800",
      },
      {
        active:
          "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-r-4 border-yellow-600 shadow-md",
        inactive: "text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800",
      },
      {
        active:
          "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-r-4 border-orange-600 shadow-md",
        inactive: "text-orange-700 hover:bg-orange-100 hover:text-orange-800",
      },
      {
        active:
          "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-r-4 border-red-600 shadow-md",
        inactive: "text-red-700 hover:bg-red-100 hover:text-red-800",
      },
      {
        active:
          "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border-r-4 border-pink-600 shadow-md",
        inactive: "text-pink-700 hover:bg-pink-100 hover:text-pink-800",
      },
      {
        active:
          "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-r-4 border-purple-600 shadow-md",
        inactive: "text-purple-700 hover:bg-purple-100 hover:text-purple-800",
      },
    ];

    const colorScheme = colorSchemes[index % colorSchemes.length];
    return isActive ? colorScheme.active : colorScheme.inactive;
  };

  const getMenuItemIconColor = (index, isActive) => {
    const iconColors = [
      isActive ? "text-green-800" : "text-green-600 group-hover:text-green-700",
      isActive
        ? "text-emerald-800"
        : "text-emerald-600 group-hover:text-emerald-700",
      isActive ? "text-teal-800" : "text-teal-600 group-hover:text-teal-700",
      isActive ? "text-cyan-800" : "text-cyan-600 group-hover:text-cyan-700",
      isActive ? "text-lime-800" : "text-lime-600 group-hover:text-lime-700",
      isActive
        ? "text-yellow-800"
        : "text-yellow-600 group-hover:text-yellow-700",
      isActive
        ? "text-orange-800"
        : "text-orange-600 group-hover:text-orange-700",
      isActive ? "text-red-800" : "text-red-600 group-hover:text-red-700",
      isActive ? "text-pink-800" : "text-pink-600 group-hover:text-pink-700",
      isActive
        ? "text-purple-800"
        : "text-purple-600 group-hover:text-purple-700",
    ];

    return iconColors[index % iconColors.length];
  };

  const getNavigationItems = () => {
    const role = user?.role;

    if (role === "ADMIN") {
      return [
        {
          name: "Dashboard",
          path: "/admin/dashboard",
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
          name: "Meetings",
          path: "/admin/meetings",
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
        },
        {
          name: "Contributions",
          path: "/admin/contributions",
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          name: "Projects",
          path: "/admin/projects",
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          ),
        },
        {
          name: "Reports",
          path: "/admin/reports",
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
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          ),
        },
        {
          name: "Announcements",
          path: "/admin/announcements",
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
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          ),
        },
        {
          name: "Clearance",
          path: "/admin/clearance",
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          name: "Students",
          path: "/admin/students",
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ),
        },
        {
          name: "Link Requests",
          path: "/admin/student-links",
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
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          ),
        },
        {
          name: "Users",
          path: "/admin/users",
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m-4-5.197v2.25M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ),
        },
        {
          name: "Officers",
          path: "/admin/officers",
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
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          ),
        },
      ];
    } else if (role === "PARENT") {
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
          name: "My Attendance",
          path: "/parent/attendance",
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
        },
        {
          name: "My Contributions",
          path: "/parent/contributions",
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          name: "Announcements",
          path: "/parent/announcements",
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
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          ),
        },
        {
          name: "Projects",
          path: "/parent/projects",
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          ),
        },
        {
          name: "My Student",
          path: "/parent/my-children",
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ),
        },
        {
          name: "Officers",
          path: "/parent/officers",
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
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          ),
        },
        {
          name: "QR Scanner",
          path: "/parent/qr-scanner",
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
                d="M12 4v1m6 11h2m-6 0h-2v4h2m0-6V9a3 3 0 00-3-3H9m1.5-2-1.5 1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
        className={`fixed inset-0 z-30 bg-green-900/20 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-50 to-emerald-50 h-full shadow-lg border-r border-green-200 transform transition-transform duration-300 ease-in-out lg:sticky lg:top-16 lg:z-10 lg:translate-x-0 lg:h-auto lg:overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        <div className="p-6 border-b border-green-200 bg-gradient-to-r from-green-100 to-emerald-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-green-800">
                Navigation
              </h2>
              <p className="text-xs text-green-600 mt-1 font-medium">
                {user?.role === "ADMIN" ? "Admin Panel" : "Parent Portal"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-green-500 hover:text-green-700 transition-colors"
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
