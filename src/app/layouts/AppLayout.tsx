import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth';
import { routes } from '@/config/routes';

/** The signed-in shell: side navigation, user box and the page outlet. */
export function AppLayout() {
  const { user, isSuperAdmin, supportTenant, setSupportTenant, signOut } = useAuth();
  const navigate = useNavigate();
  const link = ({ isActive }: { isActive: boolean }) => `shell__link${isActive ? ' active' : ''}`;
  const inGroup = !isSuperAdmin || !!supportTenant; // school pages need a school group

  const leave = async () => {
    await signOut();
    navigate(routes.login, { replace: true });
  };

  return (
    <div className="shell">
      <nav className="shell__nav" aria-label="Main">
        <div className="shell__brand">Bonzer School</div>
        <NavLink to={routes.dashboard} end className={link}>Dashboard</NavLink>
        {isSuperAdmin && <NavLink to={routes.schoolGroups} className={link}>School groups</NavLink>}
        {inGroup && (
          <>
            <NavLink to={routes.branches} className={link}>Branches</NavLink>
            <NavLink to={routes.academicYears} className={link}>Academic years</NavLink>
            <NavLink to={routes.classes} className={link}>Classes</NavLink>
            <NavLink to={routes.students} className={link}>Students</NavLink>
          </>
        )}
        <div className="shell__user">
          <div>
            <strong>{user?.name}</strong>
            <div>{user?.roles.join(', ')}</div>
            {supportTenant && <div>Group: {supportTenant}</div>}
          </div>
          {supportTenant && <button className="btn" onClick={() => { setSupportTenant(null); navigate(routes.schoolGroups); }}>Leave group</button>}
          <button className="btn" onClick={leave}>Sign out</button>
        </div>
      </nav>
      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  );
}
