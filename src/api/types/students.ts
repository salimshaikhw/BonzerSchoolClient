import type { Auditable, DateOnly } from './common';

export interface Student extends Auditable {
  branchId: string | null;
  academicYearId: string | null;
  classId: string | null;
  divisionId: string | null;
  admissionNo: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  dob: DateOnly | null;
  fatherName: string | null;
  fatherPhone: string | null;
  city: string | null;
  studentStatus: string | null;
}

/** Subset of StudentRequest used by the admission form; the API accepts many more optional fields. */
export interface StudentRequest {
  branchId: string;
  academicYearId: string;
  classId: string;
  divisionId?: string;
  firstName: string;
  lastName?: string;
  gender?: string;
  dob?: DateOnly;
  admissionDate?: DateOnly;
  fatherName?: string;
  fatherPhone?: string;
  city?: string;
  state?: string;
}
