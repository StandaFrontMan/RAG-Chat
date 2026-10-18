import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuth";

export function GuestRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
}
