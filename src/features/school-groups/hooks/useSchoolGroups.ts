import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schoolGroupsApi } from '@/api';
import { queryKeys } from '@/queries';

export const useSchoolGroups = () => useQuery({ queryKey: queryKeys.schoolGroups, queryFn: schoolGroupsApi.list });

export function useCreateSchoolGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: schoolGroupsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.schoolGroups }),
  });
}

export function useSetSchoolGroupStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => schoolGroupsApi.setStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.schoolGroups }),
  });
}
