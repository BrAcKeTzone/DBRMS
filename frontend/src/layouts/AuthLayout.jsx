import React from "react";
import Navbar from "../components/layout/Navbar";

const AuthLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      {/* Fullscreen fixed background using clinic.svg from public/assets */}
      <div
        className="fixed inset-0 -z-20 bg-center bg-cover bg-fixed"
        style={{ backgroundImage: "url('/assets/clinic.svg')" }}
        aria-hidden="true"
      />

      {/* Optional dim overlay to improve contrast for content */}
      <div className="fixed inset-0 -z-10 bg-black/30" aria-hidden="true" />

      <div className="flex flex-col min-h-screen relative z-10">
        <Navbar />
        <main className="flex-1 text-gray-900">{children}</main>
      </div>
    </div>
  );
};

export default AuthLayout;
