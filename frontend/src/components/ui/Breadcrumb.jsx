import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Breadcrumb = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);

    if (pathnames.length === 0) return [];

    const breadcrumbs = [];
    let currentPath = "";

    // Add home/dashboard link
    if (user?.role === "ADMIN") {
      breadcrumbs.push({
        name: "Admin Dashboard",
        path: "/admin/dashboard",
        isHome: true,
      });
    } else if (user?.role === "PARENT") {
      breadcrumbs.push({
        name: "Parent Dashboard",
        path: "/parent/dashboard",
        isHome: true,
      });
    }

    // Process each segment
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip the role prefix (admin/parent)
      if (index === 0 && (segment === "admin" || segment === "parent")) {
        return;
      }

      // Get display name for the segment
      const displayName = getDisplayName(segment);

      // Don't add if it's the dashboard (already added as home)
      if (segment === "dashboard") {
        return;
      }

      breadcrumbs.push({
        name: displayName,
        path: currentPath,
        isLast: index === pathnames.length - 1,
      });
    });

    return breadcrumbs;
  };

  const getDisplayName = (segment) => {
    const displayNames = {
      attendance: "Attendance",
      contributions: "Contributions",
      announcements: "Announcements",
      projects: "Projects",
      clearance: "Clearance",
      profile: "Profile",
      users: "Users",
      students: "Students",
    };

    return (
      displayNames[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs if only home/dashboard
  }

  return (
    <nav className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 mx-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {crumb.isLast ? (
              <span className="font-medium text-gray-900">{crumb.name}</span>
            ) : (
              <Link
                to={crumb.path}
                className={`hover:text-blue-600 transition-colors ${
                  crumb.isHome ? "font-medium text-blue-600" : ""
                }`}
              >
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
