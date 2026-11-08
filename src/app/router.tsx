import { lazy, Suspense } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { RoleGroups } from '@/config/roles';
import { routes } from '@/config/routes';
import { Alert, Spinner } from '@/shared/ui';
import { ProtectedRoute, RoleRoute } from './guards';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Route-level code splitting: each feature is downloaded only when first visited.
const LoginPage = lazy(() => import('@/features/login').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/features/dashboard').then((m) => ({ default: m.DashboardPage })));
const SchoolGroupsPage = lazy(() => import('@/features/school-groups').then((m) => ({ default: m.SchoolGroupsPage })));
const BranchesPage = lazy(() => import('@/features/branches').then((m) => ({ default: m.BranchesPage })));
const AcademicYearsPage = lazy(() => import('@/features/academic-years').then((m) => ({ default: m.AcademicYearsPage })));
const ClassesPage = lazy(() => import('@/features/classes').then((m) => ({ default: m.ClassesPage })));
const StudentsPage = lazy(() => import('@/features/students').then((m) => ({ default: m.StudentsPage })));
const AdmitStudentPage = lazy(() => import('@/features/students').then((m) => ({ default: m.AdmitStudentPage })));

export function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path={routes.login} element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={routes.dashboard} element={<DashboardPage />} />
            <Route path={routes.branches} element={<BranchesPage />} />
            <Route path={routes.academicYears} element={<AcademicYearsPage />} />
            <Route path={routes.classes} element={<ClassesPage />} />
            <Route path={routes.students} element={<StudentsPage />} />

            <Route element={<RoleRoute roles={RoleGroups.Platform} />}>
              <Route path={routes.schoolGroups} element={<SchoolGroupsPage />} />
            </Route>
            <Route element={<RoleRoute roles={RoleGroups.StudentAdmission} />}>
              <Route path={routes.studentNew} element={<AdmitStudentPage />} />
            </Route>

            <Route path={routes.forbidden} element={<Alert>You do not have access to that page.</Alert>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={routes.login} replace />} />
      </Routes>
    </Suspense>
  );
}

function NotFound() {
  return (
    <Alert kind="info">
      Page not found. <Link to={routes.dashboard}>Go to the dashboard</Link>
    </Alert>
  );
}
