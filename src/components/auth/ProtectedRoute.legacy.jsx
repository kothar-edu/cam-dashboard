"use client";

import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.legacy";
import { LoadingSpinner } from "../ui/loading-spinner";

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
