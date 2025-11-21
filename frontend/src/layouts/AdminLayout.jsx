import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const AdminLayout = () => {
  const { user } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== "CLINIC_STAFF") {
    return (
      <p className="text-red-500">Access Denied: Clinic Staff Access Only</p>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 p-4 lg:p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
