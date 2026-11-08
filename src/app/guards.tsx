import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth';
import type { Role } from '@/config/roles';
import { routes } from '@/config/routes';

/** Anonymous visitors go to the login page and come back to where they wanted to be. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to={routes.login} replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Only the listed roles may open the nested routes. (The API enforces this too; this is for UX.) */
export function RoleRoute({ roles }: { roles: readonly Role[] }) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) return <Navigate to={routes.forbidden} replace />;
  return <Outlet />;
}
