import React from "react";

const PasswordInput = ({
  value,
  onChange,
  placeholder = "Password",
  className = "input-field",
}) => (
  <input
    type="password"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={className}
  />
);

export default PasswordInput;
