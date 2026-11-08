/** Every URL of the app lives here. Never hard-code a path in a component. */
export const routes = {
  login: '/login',
  dashboard: '/',
  schoolGroups: '/school-groups',
  branches: '/branches',
  academicYears: '/academic-years',
  classes: '/classes',
  students: '/students',
  studentNew: '/students/new',
  forbidden: '/forbidden',
} as const;
