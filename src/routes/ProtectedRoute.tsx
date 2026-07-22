import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  console.log("Rendering ProtectedRoute.tsx");
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = user.role.toLowerCase();

  if (!allowedRoles.includes(normalizedRole)) {
    // Redirect based on role if they try to access unauthorized routes
    if (normalizedRole === "admin") return <Navigate to="/admin" replace />;
    if (normalizedRole === "manager") return <Navigate to="/manager" replace />;
    if (["employee", "cashier"].includes(normalizedRole)) return <Navigate to="/employee" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
