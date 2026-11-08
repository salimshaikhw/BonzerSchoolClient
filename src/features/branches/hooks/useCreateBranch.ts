import { useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi } from '@/api';
import { queryKeys } from '@/queries';

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: branchesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.branches }),
  });
}
