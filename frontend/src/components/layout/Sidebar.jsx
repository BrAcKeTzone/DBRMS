import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineLink,
  HiOutlinePencilAlt,
  HiOutlineChatAlt2,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineUserCircle,
  HiOutlineClipboard,
} from "react-icons/hi";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isStaff = useAuthStore((s) => s.user?.role === "CLINIC_STAFF");

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
    // Clinic Staff (formerly Staff & Admin): Dashboard → Health Records → Students → Student Links → Visit Logging → Users → System Config → Profile
    if (user?.role === "CLINIC_STAFF") {
      return [
        {
          name: "Clinic Records",
          path: "/clinic/dashboard",
          icon: <HiOutlineViewGrid className="w-5 h-5" />,
        },
        {
          name: "Health Records",
          path: "/clinic/health-records",
          icon: <HiOutlineClipboardList className="w-5 h-5" />,
        },
        {
          name: "Students",
          path: "/clinic/students",
          icon: <HiOutlineUsers className="w-5 h-5" />,
        },
        {
          name: "Student Links",
          path: "/clinic/student-links",
          icon: <HiOutlineLink className="w-5 h-5" />,
        },
        {
          name: "Visit Logging",
          path: "/clinic/visit-logging",
          icon: <HiOutlinePencilAlt className="w-5 h-5" />,
        },
        {
          name: "SMS Tracking",
          path: "/clinic/sms-tracking",
          icon: <HiOutlineChatAlt2 className="w-5 h-5" />,
        },
        {
          name: "Users",
          path: "/clinic/users",
          icon: <HiOutlineUserGroup className="w-5 h-5" />,
        },
        {
          name: "Profile",
          path: "/clinic/profile",
          icon: <HiOutlineUserCircle className="w-5 h-5" />,
        },
      ];
    } else if (user?.role === "PARENT_GUARDIAN") {
      return [
        {
          name: "Student Records",
          path: "/parent/dashboard",
          icon: <HiOutlineClipboard className="w-5 h-5" />,
        },
        {
          name: "Linked Students",
          path: "/parent/linked-students",
          icon: <HiOutlineUsers className="w-5 h-5" />,
        },
        {
          name: "My Messages",
          path: "/parent/sms-tracking",
          icon: <HiOutlineChatAlt2 className="w-5 h-5" />,
        },
        {
          name: "Profile",
          path: "/parent/profile",
          icon: <HiOutlineUserCircle className="w-5 h-5" />,
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
        className={`fixed top-16 inset-x-0 bottom-0 z-30 bg-blue-900/20 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-linear-to-b from-blue-50 to-blue-50 shadow-lg border-r border-blue-200 transform transition-transform duration-300 ease-in-out overflow-y-auto lg:sticky lg:top-16 lg:z-10 lg:translate-x-0 lg:h-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        <div className="p-6 border-b border-blue-200 bg-linear-to-r from-blue-100 to-blue-100 min-h-full">
          <div className="flex flex-col items-start mb-6">
            <div className="w-full mb-3">
              <img
                src="/assets/logo.png"
                alt="Logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/logo.svg";
                }}
                className="w-full h-56 md:h-48 sm:h-44 rounded-md object-contain"
              />
            </div>
            <div className="w-full flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-800">
                  Navigation
                </h2>
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  {isStaff ? "Clinic Panel" : "Parent Portal"}
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
                      active,
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
