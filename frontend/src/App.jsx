import React, { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage if available
    try {
      initializeAuth();
    } catch (error) {
      console.error("Failed to initialize auth:", error);
    }
  }, [initializeAuth]);

  return <AppRoutes />;
};

export default App;
