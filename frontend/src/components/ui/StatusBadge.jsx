import React from "react";

const StatusBadge = ({ children, className = "status-badge" }) => (
  <span className={className}>{children}</span>
);

export default StatusBadge;
