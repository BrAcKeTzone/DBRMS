import React from "react";

const ProgressBar = ({
  value = 0,
  max = 100,
  label = null,
  showValue = true,
  color = "blue",
  size = "md",
  className = "",
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getSizeStyles = (size) => {
    switch (size) {
      case "sm":
        return "h-2";
      case "lg":
        return "h-4";
      default:
        return "h-3";
    }
  };

  const getColorStyles = (color) => {
    switch (color) {
      case "red":
        return "bg-red-500";
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "purple":
        return "bg-purple-500";
      case "gray":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const sizeStyles = getSizeStyles(size);
  const colorStyles = getColorStyles(color);

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showValue && (
            <span className="text-sm text-gray-600">
              {value}/{max} ({Math.round(percentage)}%)
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-gray-200 rounded-full ${sizeStyles}`}>
        <div
          className={`${colorStyles} ${sizeStyles} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export { ProgressBar };
