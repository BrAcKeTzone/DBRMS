import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAuthStore } from "./store/authStore";

const App = () => {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    try {
      initializeAuth();
    } catch (error) {
      console.error("Failed to initialize auth:", error);
    }
  }, [initializeAuth]);

  return <AppRoutes />;
};

export default App;
