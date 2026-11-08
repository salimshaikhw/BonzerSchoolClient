import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toApiError } from '@/api';
import { blankToUndefined } from '@/shared/utils/format';
import { Alert, Button, Card, TextField } from '@/shared/ui';
import { useCreateSchoolGroup } from '../hooks/useSchoolGroups';

// Same rule as the API: 3-40 chars, lower-case letters, digits, hyphens, starts with a letter.
const schema = z.object({
  identifier: z.string().regex(/^[a-z][a-z0-9-]{1,38}[a-z0-9]$/, '3-40 chars: lower-case letters, digits, hyphens; start with a letter'),
  name: z.string().trim().min(1, 'Name is required'),
  code: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  adminEmail: z.string().email('Enter a valid email'),
  adminPassword: z.string().min(8, 'At least 8 characters'),
  adminFirstName: z.string().min(1, 'Required'),
  adminLastName: z.string().min(1, 'Required'),
});
type FormValues = z.infer<typeof schema>;

export function SchoolGroupForm({ onDone }: { onDone: () => void }) {
  const create = useCreateSchoolGroup();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { adminFirstName: 'Group', adminLastName: 'Admin' },
  });

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      await create.mutateAsync({
        identifier: v.identifier,
        name: v.name.trim(),
        code: blankToUndefined(v.code),
        phone: blankToUndefined(v.phone),
        email: blankToUndefined(v.email),
        adminEmail: v.adminEmail,
        adminPassword: v.adminPassword,
        adminFirstName: v.adminFirstName,
        adminLastName: v.adminLastName,
      });
      onDone();
    } catch (e) {
      setError(toApiError(e).message);
    }
  });

  return (
    <Card title="New school group (creates its database)">
      {error && <Alert>{error}</Alert>}
      <form onSubmit={onSubmit} noValidate>
        <div className="form-grid">
          <TextField label="Identifier (e.g. sunrise-trust)" error={errors.identifier?.message} {...register('identifier')} />
          <TextField label="Name" error={errors.name?.message} {...register('name')} />
          <TextField label="Code" error={errors.code?.message} {...register('code')} />
          <TextField label="Phone" error={errors.phone?.message} {...register('phone')} />
          <TextField label="Email" error={errors.email?.message} {...register('email')} />
          <TextField label="Admin email" type="email" error={errors.adminEmail?.message} {...register('adminEmail')} />
          <TextField label="Admin password" type="password" error={errors.adminPassword?.message} {...register('adminPassword')} />
          <TextField label="Admin first name" error={errors.adminFirstName?.message} {...register('adminFirstName')} />
          <TextField label="Admin last name" error={errors.adminLastName?.message} {...register('adminLastName')} />
        </div>
        <Button type="submit" variant="primary" loading={create.isPending}>Create school group</Button>
      </form>
    </Card>
  );
}
