import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, ready, hasRole } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.some((r) => hasRole(r))) {
    return (
      <div className="empty-state">
        <h3>You don't have access to this page</h3>
        <p>This area is restricted to: {roles.join(", ")}.</p>
      </div>
    );
  }

  return children;
}
