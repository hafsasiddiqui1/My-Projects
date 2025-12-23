import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-6 bg-yellow-50 border-l-4 border-yellow-300">
        You do not have permission to view this page.
      </div>
    );
  }
  return children;
}
