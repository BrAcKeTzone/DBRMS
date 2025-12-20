import React from "react";

const Button = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}) => {
  const variantClass =
    variant === "outline"
      ? "btn-secondary"
      : variant === "danger"
      ? "btn-danger"
      : "btn-primary";

  const classes = [variantClass, className].filter(Boolean).join(" ");

  return (
    <button type={type} onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
