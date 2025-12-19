import React from "react";

const Button = ({
  children,
  onClick,
  className = "btn-primary",
  type = "button",
}) => (
  <button type={type} onClick={onClick} className={className}>
    {children}
  </button>
);

export default Button;
