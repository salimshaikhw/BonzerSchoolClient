import { Outlet } from 'react-router-dom';

/** Centered shell for pages shown before sign-in. */
export function AuthLayout() {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
}
