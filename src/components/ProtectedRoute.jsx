import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { auth } = useAuth();

  if (!auth.token) {
    return <Navigate to={role === "EMPLOYEE" ? "/employee/login" : "/login"} replace />;
  }

  if (role && auth.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
