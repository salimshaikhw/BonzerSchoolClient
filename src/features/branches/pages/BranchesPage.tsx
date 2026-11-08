import { useState } from 'react';
import type { Branch } from '@/api';
import { useAuth } from '@/auth';
import { RoleGroups } from '@/config/roles';
import { useBranches } from '@/queries';
import { Alert, Button, Card, DataTable, PageHeader, QueryState, type Column } from '@/shared/ui';
import { BranchForm } from '../components/BranchForm';

const columns: Column<Branch>[] = [
  { header: 'Name', cell: (b) => b.name ?? '-' },
  { header: 'School UID', cell: (b) => b.schooluid ?? '-' },
  { header: 'City', cell: (b) => b.city ?? '-' },
  { header: 'Phone', cell: (b) => b.phone ?? '-' },
  { header: 'Email', cell: (b) => b.email ?? '-' },
];

export function BranchesPage() {
  const { data, isLoading, error } = useBranches();
  const { hasRole, isSuperAdmin, supportTenant } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const canCreate = hasRole(...RoleGroups.SchoolSetup);

  // A Super Admin has no school group until one is opened from the School groups page.
  if (isSuperAdmin && !supportTenant) {
    return <Alert kind="info">Open a school group first (School groups, then Open).</Alert>;
  }

  return (
    <>
      <PageHeader
        title="Branches"
        actions={canCreate && <Button variant="primary" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : 'New branch'}</Button>}
      />
      {showForm && <BranchForm onDone={() => setShowForm(false)} />}
      <Card>
        <QueryState isLoading={isLoading} error={error}>
          <DataTable columns={columns} rows={data ?? []} rowKey={(b) => b.id} emptyText="No branches yet. Create the first one." />
        </QueryState>
      </Card>
    </>
  );
}
