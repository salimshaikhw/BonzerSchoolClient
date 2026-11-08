import { httpClient } from '../httpClient';
import type { Division, DivisionRequest, SchoolClass, SchoolClassRequest } from '../types/academics';

export const classesApi = {
  list: async () => (await httpClient.get<SchoolClass[]>('/api/Class')).data,
  create: async (body: SchoolClassRequest) => (await httpClient.post<SchoolClass>('/api/Class', body)).data,
};

export const divisionsApi = {
  list: async () => (await httpClient.get<Division[]>('/api/Division')).data,
  create: async (body: DivisionRequest) => (await httpClient.post<Division>('/api/Division', body)).data,
};
