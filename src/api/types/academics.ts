import type { Auditable } from './common';

export interface SchoolClass extends Auditable {
  branchId: string | null;
  name: string | null;
}

export interface SchoolClassRequest {
  branchId: string;
  name: string;
}

export interface Division extends Auditable {
  classId: string | null;
  branchId: string | null;
  name: string | null;
  code: string | null;
  availableSeats: number | null;
}

export interface DivisionRequest {
  classId: string;
  branchId: string;
  name: string;
  code?: string;
  availableSeats?: number;
}
