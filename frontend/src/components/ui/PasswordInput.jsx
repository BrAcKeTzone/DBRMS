import React, { useState, useId, forwardRef } from "react";

const PasswordInput = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      placeholder = "Password",
      className = "input-field",
      required,
      error,
      id,
      labelClassName = "block text-sm font-medium text-gray-700 mb-2",
      ...rest
    },
    ref
  ) => {
    const [show, setShow] = useState(false);
    const generatedId = useId();
    const inputId = id || `password-${generatedId}`;

    const inputProps = {
      id: inputId,
      type: show ? "text" : "password",
      name,
      onChange,
      placeholder,
      className: `${className} pr-10`,
      required,
      "aria-label": label || placeholder,
      ...rest,
    };

    if (value !== undefined) {
      inputProps.value = value;
    }

    return (
      <div>
        {label ? (
          <label htmlFor={inputId} className={labelClassName}>
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        ) : null}

        <div className="relative">
          <input ref={ref} {...inputProps} />

          <button
            type="button"
            aria-pressed={show}
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            title={show ? "Hide password" : "Show password"}
          >
            {show ? (
              // eye-off icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.286.248-2.515.706-3.657M3 3l18 18"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.88 9.88A3 3 0 0114.12 14.12"
                />
              </svg>
            ) : (
              // eye icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>

          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
