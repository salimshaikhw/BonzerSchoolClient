import { Link } from 'react-router-dom';
import { useAuth } from '@/auth';
import { RoleGroups } from '@/config/roles';
import { routes } from '@/config/routes';
import { Alert, Card, PageHeader } from '@/shared/ui';

/** Landing page: tells the user where they are and offers the next step for their role. */
export function DashboardPage() {
  const { user, hasRole, isSuperAdmin, supportTenant } = useAuth();

  return (
    <>
      <PageHeader title={`Welcome, ${user?.name ?? ''}`} />

      {isSuperAdmin && !supportTenant && (
        <Alert kind="info">
          You are a platform admin. Create a school group, then press <strong>Open</strong> on it to work inside it.
        </Alert>
      )}

      <Card title="Set up your school (in this order)">
        <ol>
          {isSuperAdmin && <li><Link to={routes.schoolGroups}>School groups</Link>: create the tenant and its Group Admin</li>}
          {hasRole(...RoleGroups.SchoolSetup) || supportTenant ? (
            <>
              <li><Link to={routes.branches}>Branches</Link>: schools / campuses of the group</li>
              <li><Link to={routes.academicYears}>Academic years</Link></li>
              <li><Link to={routes.classes}>Classes and divisions</Link></li>
            </>
          ) : null}
          <li><Link to={routes.students}>Students</Link>: admission and lists</li>
        </ol>
      </Card>
    </>
  );
}
