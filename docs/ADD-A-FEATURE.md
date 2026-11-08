# How to add a feature (worked example: "Subjects")

Follow the same order every time. Each step touches one layer.

## 1. Know the API
Open `TestGuide/01-School-Setup-Hierarchy.md` or Swagger (`/swagger`) and note the endpoint, the request body, the response and who is allowed to call it.
Example: `POST /api/Subject` `{ "name": "English", "code": "ENG" }`, allowed for GroupAdmin, BranchAdmin, Principal, VicePrincipal, Hod.

## 2. Types (`src/api/types/`)
```ts
// academics.ts
export interface Subject extends Auditable { name: string | null; code: string | null }
export interface SubjectRequest { name: string; code?: string }
```
Export it from `src/api/index.ts`.

## 3. Endpoint (`src/api/endpoints/subjects.ts`)
```ts
export const subjectsApi = {
  list: async () => (await httpClient.get<Subject[]>('/api/Subject')).data,
  create: async (body: SubjectRequest) => (await httpClient.post<Subject>('/api/Subject', body)).data,
};
```
Export `subjectsApi` from `src/api/index.ts`.

## 4. Route and query key
- `config/routes.ts`: `subjects: '/subjects'`
- `queries/queryKeys.ts`: `subjects: ['subjects'] as const`

## 5. Feature folder `src/features/subjects/`
```
index.ts                     export { SubjectsPage } from './pages/SubjectsPage';
hooks/useSubjects.ts         useQuery (list) + useMutation (create) that invalidates queryKeys.subjects
pages/SubjectsPage.tsx       header + form (react-hook-form + zod) + DataTable inside QueryState
```
Copy `features/academic-years` as a starting point; it is the smallest complete example.
If another feature also needs the subject list, move the `useQuery` into `src/queries/referenceData.ts`.

## 6. Wire it into the app (`src/app`)
- `router.tsx`: add the `lazy()` import and a `<Route path={routes.subjects} ...>`. Wrap it in `<RoleRoute roles={RoleGroups.AcademicLeadership} />` if only some roles may open it.
- `layouts/AppLayout.tsx`: add a `NavLink`.
- Add the feature name to the `features` list in `eslint.config.js` so the "no cross-feature import" rule covers it.

## 7. Test
- Logic (schema, helpers) as plain unit tests.
- At least one component or page test using `renderWithProviders` and `vi.mock('@/api')`.

## 8. Before you open the pull request
```
npm run typecheck && npm run lint && npm test && npm run build
```
Then check the page by hand: loading state, empty state, error state (stop the API), validation messages, and a role that must NOT see the page.

## Checklist
- [ ] No hard-coded paths, role names or query keys
- [ ] Blank optional fields are not sent as `""`
- [ ] Mutation invalidates the right query key
- [ ] Error message shown from `toApiError(e).message`
- [ ] Labels on every input, keyboard usable
- [ ] No `any`, no `console.log`, no secrets
