import React from "react";

const Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "input-field",
  ...rest
}) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    type={type}
    className={className}
    {...rest}
  />
);

export default Input;
