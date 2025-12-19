import React from "react";

const DashboardCard = ({ title, children, className = "" }) => (
  <div className={`card ${className}`}>
    {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
    {children}
  </div>
);

export default DashboardCard;
