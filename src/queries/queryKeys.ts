/** One place for every React Query cache key, so invalidation after a mutation never misses. */
export const queryKeys = {
  schoolGroups: ['school-groups'] as const,
  branches: ['branches'] as const,
  academicYears: ['academic-years'] as const,
  classes: ['classes'] as const,
  divisions: ['divisions'] as const,
  institutionTypes: ['institution-types'] as const,
  mediums: ['mediums'] as const,
  students: ['students'] as const,
  studentsPage: (page: number, pageSize: number) => ['students', 'page', page, pageSize] as const,
};
