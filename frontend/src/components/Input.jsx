import React from "react";

const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className,
  label,
  error,
  required = false,
  disabled = false,
  name,
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`border border-gray-300 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${
          className || ""
        }`}
        required={required}
        disabled={disabled}
        name={name}
        id={id || name}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
