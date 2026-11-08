import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi, divisionsApi } from '@/api';
import { queryKeys } from '@/queries';

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.classes }),
  });
}

export function useCreateDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: divisionsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.divisions }),
  });
}
