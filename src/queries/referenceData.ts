import { useQuery } from '@tanstack/react-query';
import { academicYearsApi, branchesApi, classesApi, divisionsApi, lookupsApi } from '@/api';
import { queryKeys } from './queryKeys';

/**
 * Read-only lists that several features need (dropdowns, name lookups).
 * They live here, not in a feature, because features may not import each other.
 */
const LOOKUP_STALE_MS = 5 * 60_000;

export const useBranches = () => useQuery({ queryKey: queryKeys.branches, queryFn: branchesApi.list });
export const useAcademicYears = () => useQuery({ queryKey: queryKeys.academicYears, queryFn: academicYearsApi.list });
export const useClasses = () => useQuery({ queryKey: queryKeys.classes, queryFn: classesApi.list });
export const useDivisions = () => useQuery({ queryKey: queryKeys.divisions, queryFn: divisionsApi.list });

// Shared lookups change almost never.
export const useInstitutionTypes = () =>
  useQuery({ queryKey: queryKeys.institutionTypes, queryFn: lookupsApi.institutionTypes, staleTime: LOOKUP_STALE_MS });
export const useMediums = () =>
  useQuery({ queryKey: queryKeys.mediums, queryFn: lookupsApi.mediums, staleTime: LOOKUP_STALE_MS });
