import React from "react";
import Navbar from "../components/layout/Navbar";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 text-gray-900">{children}</main>
    </div>
  );
};

export default AuthLayout;
