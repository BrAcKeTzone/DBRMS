import React from "react";

const StatusBadge = ({
  status,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const getStatusStyles = (status) => {
    const baseStatus = status?.toLowerCase();

    switch (baseStatus) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pass":
        return "bg-green-100 text-green-800 border-green-200";
      case "fail":
        return "bg-red-100 text-red-800 border-red-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSizeStyles = (size) => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "lg":
        return "px-4 py-2 text-base";
      default:
        return "px-3 py-1 text-sm";
    }
  };

  const statusStyles = getStatusStyles(status);
  const sizeStyles = getSizeStyles(size);

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${statusStyles}
        ${sizeStyles}
        ${className}
      `}
    >
      {status?.toUpperCase()}
    </span>
  );
};

export default StatusBadge;
