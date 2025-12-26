import React, { useId, forwardRef } from "react";

const Input = forwardRef(
  (
    {
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
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;

    // Determine if we should pass value prop to the input
    // If value is undefined, we don't pass it to allow uncontrolled usage (defaultValue)
    const inputProps = {
      id: inputId,
      onChange,
      placeholder,
      type,
      className,
      "aria-label": label || rest["aria-label"] || placeholder,
      required,
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
        <input ref={ref} {...inputProps} />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
