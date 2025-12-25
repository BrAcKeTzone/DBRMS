import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAuthStore } from "./store/authStore";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled error in component tree:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 text-red-800">
          <h2 className="font-semibold">Something went wrong.</h2>
          <pre className="mt-2 text-sm">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  // Use selector form to avoid re-running the effect when unrelated parts of the store update
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    try {
      initializeAuth();
    } catch (error) {
      console.error("Failed to initialize auth:", error);
    }
    // initializeAuth is stable (selector returns same reference), empty deps guard is fine
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
};

export default App;
