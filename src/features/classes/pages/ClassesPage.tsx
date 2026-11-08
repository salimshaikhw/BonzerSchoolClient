import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toApiError, type Division, type SchoolClass } from '@/api';
import { useAuth } from '@/auth';
import { RoleGroups } from '@/config/roles';
import { useBranches, useClasses, useDivisions } from '@/queries';
import { Alert, Button, Card, DataTable, PageHeader, QueryState, SelectField, TextField, type Column } from '@/shared/ui';
import { nameLookup } from '@/shared/utils/format';
import { useCreateClass, useCreateDivision } from '../hooks/useClassMutations';

const classSchema = z.object({
  branchId: z.string().min(1, 'Select a branch'),
  name: z.string().trim().min(1, 'Required'),
});
const divisionSchema = z.object({
  classId: z.string().min(1, 'Select a class'),
  name: z.string().trim().min(1, 'Required'),
  code: z.string().optional(),
  availableSeats: z.coerce.number().int().min(0).max(1000),
});
type ClassValues = z.infer<typeof classSchema>;
type DivisionValues = z.input<typeof divisionSchema>;

export function ClassesPage() {
  const branches = useBranches();
  const classes = useClasses();
  const divisions = useDivisions();
  const createClass = useCreateClass();
  const createDivision = useCreateDivision();
  const { hasRole } = useAuth();
  const canEdit = hasRole(...RoleGroups.AcademicLeadership);
  const [error, setError] = useState<string | null>(null);

  const classForm = useForm<ClassValues>({ resolver: zodResolver(classSchema) });
  const divisionForm = useForm<DivisionValues>({ resolver: zodResolver(divisionSchema), defaultValues: { availableSeats: 40 } });

  const branchName = nameLookup(branches.data, (b) => b.name);
  const className = nameLookup(classes.data, (c) => c.name);

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(toApiError(e).message);
    }
  };

  const onCreateClass = classForm.handleSubmit((v) =>
    run(async () => {
      await createClass.mutateAsync(v);
      classForm.reset({ branchId: v.branchId, name: '' });
    }),
  );

  const onCreateDivision = divisionForm.handleSubmit((v) =>
    run(async () => {
      const parent = classes.data?.find((c) => c.id === v.classId);
      if (!parent?.branchId) throw new Error('The selected class has no branch.');
      const parsed = divisionSchema.parse(v);
      await createDivision.mutateAsync({
        classId: parsed.classId,
        branchId: parent.branchId,
        name: parsed.name,
        code: parsed.code || undefined,
        availableSeats: parsed.availableSeats,
      });
      divisionForm.reset({ classId: v.classId, name: '', code: '', availableSeats: 40 });
    }),
  );

  const classColumns: Column<SchoolClass>[] = [
    { header: 'Class', cell: (c) => c.name ?? '-' },
    { header: 'Branch', cell: (c) => branchName(c.branchId) },
  ];
  const divisionColumns: Column<Division>[] = [
    { header: 'Division', cell: (d) => d.name ?? '-' },
    { header: 'Code', cell: (d) => d.code ?? '-' },
    { header: 'Class', cell: (d) => className(d.classId) },
    { header: 'Seats', cell: (d) => d.availableSeats ?? '-' },
  ];

  const branchOptions = (branches.data ?? []).map((b) => ({ value: b.id, label: b.name ?? b.id }));
  const classOptions = (classes.data ?? []).map((c) => ({ value: c.id, label: `${c.name ?? c.id} (${branchName(c.branchId)})` }));

  return (
    <>
      <PageHeader title="Classes and divisions" />
      {error && <Alert>{error}</Alert>}

      {canEdit && (
        <div className="form-grid">
          <Card title="New class">
            <form onSubmit={onCreateClass} noValidate>
              <SelectField label="Branch" options={branchOptions} error={classForm.formState.errors.branchId?.message} {...classForm.register('branchId')} />
              <TextField label="Name (e.g. 1st)" error={classForm.formState.errors.name?.message} {...classForm.register('name')} />
              <Button type="submit" variant="primary" loading={createClass.isPending}>Add class</Button>
            </form>
          </Card>
          <Card title="New division">
            <form onSubmit={onCreateDivision} noValidate>
              <SelectField label="Class" options={classOptions} error={divisionForm.formState.errors.classId?.message} {...divisionForm.register('classId')} />
              <TextField label="Name (e.g. A)" error={divisionForm.formState.errors.name?.message} {...divisionForm.register('name')} />
              <TextField label="Code (e.g. 1A)" {...divisionForm.register('code')} />
              <TextField label="Seats" type="number" error={divisionForm.formState.errors.availableSeats?.message} {...divisionForm.register('availableSeats')} />
              <Button type="submit" variant="primary" loading={createDivision.isPending}>Add division</Button>
            </form>
          </Card>
        </div>
      )}

      <Card title="Classes">
        <QueryState isLoading={classes.isLoading} error={classes.error}>
          <DataTable columns={classColumns} rows={classes.data ?? []} rowKey={(c) => c.id} />
        </QueryState>
      </Card>
      <Card title="Divisions">
        <QueryState isLoading={divisions.isLoading} error={divisions.error}>
          <DataTable columns={divisionColumns} rows={divisions.data ?? []} rowKey={(d) => d.id} />
        </QueryState>
      </Card>
    </>
  );
}
