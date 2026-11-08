import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Student } from '@/api';
import { useAuth } from '@/auth';
import { RoleGroups } from '@/config/roles';
import { routes } from '@/config/routes';
import { useClasses, useDivisions } from '@/queries';
import { Button, Card, DataTable, PageHeader, QueryState, type Column } from '@/shared/ui';
import { formatDate, nameLookup } from '@/shared/utils/format';
import { useStudentsPage } from '../hooks/useStudents';

const PAGE_SIZE = 20;

export function StudentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, isFetching } = useStudentsPage(page, PAGE_SIZE);
  const classes = useClasses();
  const divisions = useDivisions();
  const { hasRole } = useAuth();

  const className = nameLookup(classes.data, (c) => c.name);
  const divisionName = nameLookup(divisions.data, (d) => d.name);

  const columns: Column<Student>[] = [
    { header: 'Adm. no', cell: (s) => s.admissionNo ?? '-' },
    { header: 'Name', cell: (s) => [s.firstName, s.lastName].filter(Boolean).join(' ') || '-' },
    { header: 'Class', cell: (s) => `${className(s.classId)} ${divisionName(s.divisionId) === '-' ? '' : divisionName(s.divisionId)}`.trim() },
    { header: 'Gender', cell: (s) => s.gender ?? '-' },
    { header: 'Date of birth', cell: (s) => formatDate(s.dob) },
    { header: 'Father', cell: (s) => s.fatherName ?? '-' },
    { header: 'Status', cell: (s) => s.studentStatus ?? '-' },
  ];

  return (
    <>
      <PageHeader
        title="Students"
        actions={hasRole(...RoleGroups.StudentAdmission) && <Link to={routes.studentNew}><Button variant="primary">Admit student</Button></Link>}
      />
      <Card>
        <QueryState isLoading={isLoading} error={error}>
          <DataTable columns={columns} rows={data?.items ?? []} rowKey={(s) => s.id} emptyText="No students yet." />
          {data && data.totalPages > 1 && (
            <div className="row" style={{ marginTop: 12 }}>
              <Button disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span>Page {data.page} of {data.totalPages} ({data.totalCount} students)</span>
              <Button disabled={page >= data.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </QueryState>
      </Card>
    </>
  );
}
