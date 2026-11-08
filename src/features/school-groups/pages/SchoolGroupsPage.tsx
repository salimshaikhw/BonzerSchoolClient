import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SchoolGroup } from '@/api';
import { useAuth } from '@/auth';
import { routes } from '@/config/routes';
import { Button, Card, DataTable, PageHeader, QueryState, StatusBadge, type Column } from '@/shared/ui';
import { SchoolGroupForm } from '../components/SchoolGroupForm';
import { useSchoolGroups, useSetSchoolGroupStatus } from '../hooks/useSchoolGroups';

/** Super Admin screen: list school groups (tenants), create new ones, switch support mode, (de)activate. */
export function SchoolGroupsPage() {
  const { data, isLoading, error } = useSchoolGroups();
  const setStatus = useSetSchoolGroupStatus();
  const { supportTenant, setSupportTenant } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const open = (group: SchoolGroup) => {
    setSupportTenant(group.identifier);
    navigate(routes.branches);
  };

  const columns: Column<SchoolGroup>[] = [
    { header: 'Identifier', cell: (g) => g.identifier },
    { header: 'Name', cell: (g) => g.name ?? '-' },
    { header: 'Database', cell: (g) => g.databaseName },
    { header: 'Status', cell: (g) => <StatusBadge active={g.isActive} /> },
    {
      header: 'Actions',
      cell: (g) => (
        <span className="row">
          <Button onClick={() => open(g)} disabled={!g.isActive}>
            {supportTenant === g.identifier ? 'Open (current)' : 'Open'}
          </Button>
          <Button
            variant={g.isActive ? 'danger' : 'default'}
            loading={setStatus.isPending}
            onClick={() => setStatus.mutate({ id: g.id, isActive: !g.isActive })}
          >
            {g.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="School groups" actions={<Button variant="primary" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : 'New school group'}</Button>} />
      {showForm && <SchoolGroupForm onDone={() => setShowForm(false)} />}
      <Card>
        <QueryState isLoading={isLoading} error={error}>
          <DataTable columns={columns} rows={data ?? []} rowKey={(g) => g.id} />
        </QueryState>
      </Card>
    </>
  );
}
