import React from "react";

const DashboardCard = ({ title, children, className = "", headerActions }) => (
  <div
    className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}
  >
    <div className="flex items-center justify-center mb-2 relative">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
        {title}
      </h3>
      {headerActions && <div className="absolute right-0">{headerActions}</div>}
    </div>
    <div>{children}</div>
  </div>
);

export default DashboardCard;
