import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const DashboardCard = ({
  title,
  children,
  className = "",
  headerActions = null,
  loading = false,
  value,
  subtitle,
  icon,
  color = "blue",
}) => {
  const getIconColorStyles = (color) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-600";
      case "red":
        return "bg-red-100 text-red-600";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "indigo":
        return "bg-indigo-100 text-indigo-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  const iconColorStyles = getIconColorStyles(color);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {headerActions && (
            <div className="flex items-center space-x-2">{headerActions}</div>
          )}
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Stat card content */}
            {value && (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {title && !children && (
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {title}
                    </h4>
                  )}
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {value}
                  </p>
                  {subtitle && (
                    <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
                  )}
                </div>
                {icon && (
                  <div className={`p-3 rounded-full ${iconColorStyles}`}>
                    {icon}
                  </div>
                )}
              </div>
            )}

            {/* Regular card content */}
            {children}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
