import type { Auditable, DateOnly } from './common';

/** A school group is the tenant: one database, many branches. */
export interface SchoolGroup extends Auditable {
  identifier: string;
  name: string | null;
  code: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  databaseName: string;
  isActive: boolean;
}

export interface CreateSchoolGroupRequest {
  identifier: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface UpdateSchoolGroupRequest {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Branch extends Auditable {
  groupId: string | null;
  institutionTypeId: string | null;
  mediumId: string | null;
  schooluid: string | null;
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
}

export interface BranchRequest {
  institutionTypeId?: string;
  mediumId?: string;
  schooluid?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

export interface Lookup extends Auditable {
  name: string | null;
}

export interface AcademicYear extends Auditable {
  yearName: string | null;
  startDate: DateOnly | null;
  endDate: DateOnly | null;
  isActive: boolean | null;
}

export interface AcademicYearRequest {
  yearName: string;
  startDate: DateOnly;
  endDate: DateOnly;
  isActive: boolean;
}
