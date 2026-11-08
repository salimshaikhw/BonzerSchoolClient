import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toApiError } from '@/api';
import { useInstitutionTypes, useMediums } from '@/queries';
import { Alert, Button, Card, SelectField, TextField } from '@/shared/ui';
import { blankToUndefined } from '@/shared/utils/format';
import { useCreateBranch } from '../hooks/useCreateBranch';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  institutionTypeId: z.string().min(1, 'Select a type'),
  mediumId: z.string().min(1, 'Select a medium'),
  schooluid: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  address: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function BranchForm({ onDone }: { onDone: () => void }) {
  const types = useInstitutionTypes();
  const mediums = useMediums();
  const create = useCreateBranch();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const toOptions = (items?: { id: string; name: string | null }[]) =>
    (items ?? []).map((i) => ({ value: i.id, label: i.name ?? i.id }));

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      await create.mutateAsync({
        name: v.name.trim(),
        institutionTypeId: v.institutionTypeId,
        mediumId: v.mediumId,
        schooluid: blankToUndefined(v.schooluid),
        city: blankToUndefined(v.city),
        state: blankToUndefined(v.state),
        phone: blankToUndefined(v.phone),
        email: blankToUndefined(v.email),
        address: blankToUndefined(v.address),
      });
      onDone();
    } catch (e) {
      setError(toApiError(e).message);
    }
  });

  return (
    <Card title="New branch">
      {error && <Alert>{error}</Alert>}
      <form onSubmit={onSubmit} noValidate>
        <div className="form-grid">
          <TextField label="Name" error={errors.name?.message} {...register('name')} />
          <SelectField label="Institution type" options={toOptions(types.data)} error={errors.institutionTypeId?.message} {...register('institutionTypeId')} />
          <SelectField label="Medium" options={toOptions(mediums.data)} error={errors.mediumId?.message} {...register('mediumId')} />
          <TextField label="School UID" {...register('schooluid')} />
          <TextField label="City" {...register('city')} />
          <TextField label="State" {...register('state')} />
          <TextField label="Phone" {...register('phone')} />
          <TextField label="Email" error={errors.email?.message} {...register('email')} />
          <TextField label="Address" {...register('address')} />
        </div>
        <Button type="submit" variant="primary" loading={create.isPending}>Create branch</Button>
      </form>
    </Card>
  );
}
