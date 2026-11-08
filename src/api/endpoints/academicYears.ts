import { httpClient } from '../httpClient';
import type { AcademicYear, AcademicYearRequest } from '../types/organization';

export const academicYearsApi = {
  list: async () => (await httpClient.get<AcademicYear[]>('/api/AcademicYear')).data,
  create: async (body: AcademicYearRequest) => (await httpClient.post<AcademicYear>('/api/AcademicYear', body)).data,
};
