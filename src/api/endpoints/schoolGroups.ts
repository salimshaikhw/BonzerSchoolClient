import { httpClient } from '../httpClient';
import type { CreateSchoolGroupRequest, SchoolGroup, UpdateSchoolGroupRequest } from '../types/organization';

export const schoolGroupsApi = {
  list: async () => (await httpClient.get<SchoolGroup[]>('/api/SchoolGroup')).data,
  get: async (id: string) => (await httpClient.get<SchoolGroup>(`/api/SchoolGroup/${id}`)).data,
  /** Super Admin only: creates the group, its database and its first Group Admin. */
  create: async (body: CreateSchoolGroupRequest) => (await httpClient.post<SchoolGroup>('/api/SchoolGroup', body)).data,
  update: async (id: string, body: UpdateSchoolGroupRequest) =>
    (await httpClient.put<SchoolGroup>(`/api/SchoolGroup/${id}`, body)).data,
  setStatus: async (id: string, isActive: boolean) =>
    (await httpClient.put<SchoolGroup>(`/api/SchoolGroup/${id}/status`, { isActive })).data,
};
