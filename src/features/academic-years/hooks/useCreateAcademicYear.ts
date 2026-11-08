import { useMutation, useQueryClient } from '@tanstack/react-query';
import { academicYearsApi } from '@/api';
import { queryKeys } from '@/queries';

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: academicYearsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.academicYears }),
  });
}
