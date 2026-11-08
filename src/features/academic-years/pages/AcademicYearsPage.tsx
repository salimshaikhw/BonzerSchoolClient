import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toApiError, type AcademicYear } from '@/api';
import { useAuth } from '@/auth';
import { RoleGroups } from '@/config/roles';
import { useAcademicYears } from '@/queries';
import { Alert, Button, Card, DataTable, PageHeader, QueryState, StatusBadge, TextField, type Column } from '@/shared/ui';
import { formatDate } from '@/shared/utils/format';
import { useCreateAcademicYear } from '../hooks/useCreateAcademicYear';

const schema = z
  .object({
    yearName: z.string().trim().min(1, 'Required, e.g. 2026-27'),
    startDate: z.string().min(1, 'Required'),
    endDate: z.string().min(1, 'Required'),
    isActive: z.boolean(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate > v.startDate, {
    path: ['endDate'],
    message: 'End date must be after the start date',
  });
type FormValues = z.infer<typeof schema>;

const columns: Column<AcademicYear>[] = [
  { header: 'Year', cell: (y) => y.yearName ?? '-' },
  { header: 'Starts', cell: (y) => formatDate(y.startDate) },
  { header: 'Ends', cell: (y) => formatDate(y.endDate) },
  { header: 'Status', cell: (y) => <StatusBadge active={y.isActive} /> },
];

export function AcademicYearsPage() {
  const { data, isLoading, error } = useAcademicYears();
  const create = useCreateAcademicYear();
  const { hasRole } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { isActive: true } });

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null);
    try {
      await create.mutateAsync(v);
      reset();
    } catch (e) {
      setFormError(toApiError(e).message);
    }
  });

  return (
    <>
      <PageHeader title="Academic years" />
      {hasRole(...RoleGroups.SchoolSetup) && (
        <Card title="New academic year">
          {formError && <Alert>{formError}</Alert>}
          <form onSubmit={onSubmit} noValidate>
            <div className="form-grid">
              <TextField label="Year name" placeholder="2026-27" error={errors.yearName?.message} {...register('yearName')} />
              <TextField label="Start date" type="date" error={errors.startDate?.message} {...register('startDate')} />
              <TextField label="End date" type="date" error={errors.endDate?.message} {...register('endDate')} />
              <TextField label="Active" type="checkbox" {...register('isActive')} />
            </div>
            <Button type="submit" variant="primary" loading={create.isPending}>Create</Button>
          </form>
        </Card>
      )}
      <Card>
        <QueryState isLoading={isLoading} error={error}>
          <DataTable columns={columns} rows={data ?? []} rowKey={(y) => y.id} />
        </QueryState>
      </Card>
    </>
  );
}
