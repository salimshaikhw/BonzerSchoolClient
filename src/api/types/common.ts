/** Fields every API response row carries (AuditableResponse on the server). */
export interface Auditable {
  id: string;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

/** Server-side paging (PagedStudentsResponse). */
export interface Paged<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Date-only values travel as 'YYYY-MM-DD'. */
export type DateOnly = string;
