import React from "react";

const LoadingSpinner = ({
  size = "md",
  color = "blue",
  className = "",
  text = null,
}) => {
  const getSizeStyles = (size) => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "lg":
        return "h-12 w-12";
      case "xl":
        return "h-16 w-16";
      default:
        return "h-8 w-8";
    }
  };

  const getColorStyles = (color) => {
    switch (color) {
      case "white":
        return "border-white";
      case "gray":
        return "border-gray-600";
      case "red":
        return "border-red-600";
      case "green":
        return "border-green-600";
      case "yellow":
        return "border-yellow-600";
      case "purple":
        return "border-purple-600";
      default:
        return "border-blue-600";
    }
  };

  const sizeStyles = getSizeStyles(size);
  const colorStyles = getColorStyles(color);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full border-b-2 border-t-transparent
          ${sizeStyles}
          ${colorStyles}
        `}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
