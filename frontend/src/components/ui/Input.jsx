import React, { useId } from "react";

const Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "input-field",
  label,
  id,
  labelClassName = "block text-sm font-medium text-gray-700 mb-2",
  required,
  ...rest
}) => {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;

  return (
    <div>
      {label ? (
        <label htmlFor={inputId} className={labelClassName}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      ) : null}
      <input
        id={inputId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        className={className}
        aria-label={label || rest["aria-label"] || placeholder}
        required={required}
        {...rest}
      />
    </div>
  );
};

export default Input;
