import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType: "admin" | "staff";
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userType = localStorage.getItem("userType");

  if (!isLoggedIn || userType !== requiredUserType) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
