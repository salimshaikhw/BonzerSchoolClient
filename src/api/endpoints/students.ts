import { httpClient } from '../httpClient';
import type { Paged } from '../types/common';
import type { Student, StudentRequest } from '../types/students';

export const studentsApi = {
  paged: async (page: number, pageSize: number) =>
    (await httpClient.get<Paged<Student>>('/api/Student/paged', { params: { page, pageSize } })).data,
  get: async (id: string) => (await httpClient.get<Student>(`/api/Student/${id}`)).data,
  create: async (body: StudentRequest) => (await httpClient.post<Student>('/api/Student', body)).data,
  suspend: async (id: string) => {
    await httpClient.post(`/api/Student/${id}/suspend`);
  },
  activate: async (id: string) => {
    await httpClient.post(`/api/Student/${id}/activate`);
  },
};
