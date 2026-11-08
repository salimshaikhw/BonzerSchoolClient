import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '@/api';
import { queryKeys } from '@/queries';

/** One page of students. keepPreviousData avoids a blank table flash while the next page loads. */
export function useStudentsPage(page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKeys.studentsPage(page, pageSize),
    queryFn: () => studentsApi.paged(page, pageSize),
    placeholderData: keepPreviousData,
  });
}

export function useAdmitStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.students }),
  });
}
