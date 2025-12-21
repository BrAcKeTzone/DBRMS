import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const ParentLayout = () => {
  const { user } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== "PARENT_GUARDIAN") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">Parent access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 p-4 lg:p-6 text-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
