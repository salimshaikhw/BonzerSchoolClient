import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { toApiError } from '@/api';
import { routes } from '@/config/routes';
import { useAcademicYears, useBranches, useClasses, useDivisions } from '@/queries';
import { Alert, Button, Card, PageHeader, SelectField, TextField } from '@/shared/ui';
import { blankToUndefined } from '@/shared/utils/format';
import { useAdmitStudent } from '../hooks/useStudents';

const today = () => new Date().toISOString().slice(0, 10);

const schema = z.object({
  branchId: z.string().min(1, 'Select a branch'),
  academicYearId: z.string().min(1, 'Select an academic year'),
  classId: z.string().min(1, 'Select a class'),
  divisionId: z.string().optional(),
  firstName: z.string().trim().min(1, 'Required'),
  lastName: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().min(1, 'Required').refine((v) => v < today(), 'Date of birth must be in the past'),
  admissionDate: z.string().min(1, 'Required'),
  fatherName: z.string().optional(),
  fatherPhone: z.string().regex(/^\d{10}$/, 'Enter a 10 digit number').or(z.literal('')).optional(),
  city: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function AdmitStudentPage() {
  const navigate = useNavigate();
  const admit = useAdmitStudent();
  const branches = useBranches();
  const years = useAcademicYears();
  const classes = useClasses();
  const divisions = useDivisions();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { admissionDate: today() },
  });

  // Dependent dropdowns: classes of the chosen branch, divisions of the chosen class.
  const branchId = watch('branchId');
  const classId = watch('classId');
  const classOptions = (classes.data ?? []).filter((c) => !branchId || c.branchId === branchId).map((c) => ({ value: c.id, label: c.name ?? c.id }));
  const divisionOptions = (divisions.data ?? []).filter((d) => d.classId === classId).map((d) => ({ value: d.id, label: d.name ?? d.id }));

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      await admit.mutateAsync({
        branchId: v.branchId,
        academicYearId: v.academicYearId,
        classId: v.classId,
        divisionId: blankToUndefined(v.divisionId),
        firstName: v.firstName.trim(),
        lastName: blankToUndefined(v.lastName),
        gender: blankToUndefined(v.gender),
        dob: v.dob,
        admissionDate: v.admissionDate,
        fatherName: blankToUndefined(v.fatherName),
        fatherPhone: blankToUndefined(v.fatherPhone),
        city: blankToUndefined(v.city),
      });
      navigate(routes.students);
    } catch (e) {
      setError(toApiError(e).message);
    }
  });

  return (
    <>
      <PageHeader title="Admit student" />
      <Card>
        {error && <Alert>{error}</Alert>}
        <form onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            <SelectField label="Branch" options={(branches.data ?? []).map((b) => ({ value: b.id, label: b.name ?? b.id }))} error={errors.branchId?.message} {...register('branchId')} />
            <SelectField label="Academic year" options={(years.data ?? []).map((y) => ({ value: y.id, label: y.yearName ?? y.id }))} error={errors.academicYearId?.message} {...register('academicYearId')} />
            <SelectField label="Class" options={classOptions} error={errors.classId?.message} {...register('classId')} />
            <SelectField label="Division" options={divisionOptions} {...register('divisionId')} />
            <TextField label="First name" error={errors.firstName?.message} {...register('firstName')} />
            <TextField label="Last name" {...register('lastName')} />
            <SelectField label="Gender" options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} {...register('gender')} />
            <TextField label="Date of birth" type="date" error={errors.dob?.message} {...register('dob')} />
            <TextField label="Admission date" type="date" error={errors.admissionDate?.message} {...register('admissionDate')} />
            <TextField label="Father's name" {...register('fatherName')} />
            <TextField label="Father's phone" inputMode="numeric" error={errors.fatherPhone?.message} {...register('fatherPhone')} />
            <TextField label="City" {...register('city')} />
          </div>
          <div className="row">
            <Button type="submit" variant="primary" loading={admit.isPending}>Admit</Button>
            <Button type="button" onClick={() => navigate(routes.students)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
