import { httpClient } from '../httpClient';
import type { Branch, BranchRequest, Lookup } from '../types/organization';

export const branchesApi = {
  list: async () => (await httpClient.get<Branch[]>('/api/Branch')).data,
  create: async (body: BranchRequest) => (await httpClient.post<Branch>('/api/Branch', body)).data,
  update: async (id: string, body: BranchRequest) => (await httpClient.put<Branch>(`/api/Branch/${id}`, body)).data,
};

/** Shared lookups (live in the catalog database). */
export const lookupsApi = {
  institutionTypes: async () => (await httpClient.get<Lookup[]>('/api/InstitutionType')).data,
  mediums: async () => (await httpClient.get<Lookup[]>('/api/Medium')).data,
};
