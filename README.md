# Bonzer School: web client

The browser front end for the Bonzer School API (a multi-tenant school ERP).
**Stack:** React 18, TypeScript (strict), Vite, React Router, TanStack Query, react-hook-form + zod, axios, Vitest.

> New to the project? Read sections 1 to 4 on your first day, then keep section 8 (the rules) open while you work.

## Contents
1. [Quick start](#1-quick-start)
2. [What the app does today](#2-what-the-app-does-today)
3. [Folder map](#3-folder-map)
4. [The one rule that keeps the code clean](#4-the-one-rule-that-keeps-the-code-clean)
5. [The layers in detail](#5-the-layers-in-detail)
6. [How one request flows through the layers](#6-how-one-request-flows-through-the-layers)
7. [Key concepts you must understand](#7-key-concepts-you-must-understand)
8. [Rules every developer must follow](#8-rules-every-developer-must-follow)
9. [Daily workflow](#9-daily-workflow)
10. [Definition of done](#10-definition-of-done)
11. [Troubleshooting](#11-troubleshooting)
12. [Further reading and backlog](#12-further-reading-and-backlog)

---

## 1. Quick start

**You need:** Node 20 or newer, and the API running (see the API repo's `TestGuide/01-School-Setup-Hierarchy.md`, Part A). The API listens on `http://localhost:5102`.

```
npm install
cp .env.example .env.local        # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev                       # http://localhost:5173
```

Sign in as the Development Super Admin: `superadmin@bonzer.local` / `Admin@123`.
Then: **School groups** -> create one -> press **Open** -> add branches, academic years, classes, students.
The API allows cross-origin calls from `localhost` in Development, so no proxy is needed.

| Command | What it does | When to run it |
|---|---|---|
| `npm run dev` | Dev server with hot reload | while coding |
| `npm run typecheck` | TypeScript only | often |
| `npm run lint` | ESLint, **including the architecture rules** | before every commit |
| `npm test` | All tests once | before every commit |
| `npm run test:watch` | Tests re-run on change | while writing tests |
| `npm run build` | Type-check + production build into `dist/` | before every pull request |
| `npm run format` | Prettier formatting | before committing |

## 2. What the app does today

| Area | Who can use it | Screens |
|---|---|---|
| Sign in | everyone | login with automatic token renewal |
| School groups | Super Admin | list, create (creates the tenant database), activate / deactivate, **Open** (support mode) |
| Branches | Group Admin, Branch Admin create; all read | list, create |
| Academic years | Group Admin, Branch Admin create; all read | list, create |
| Classes and divisions | academic leadership create; all read | list, create |
| Students | admission roles create; all read | paged list, admission form |

Not built yet (see the backlog in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)): staff, subjects, fees, exams, attendance, timetable, student lifecycle actions, bulk upload, analytics.

## 3. Folder map

```
web/
  docs/
    ARCHITECTURE.md        layers, data flow, conventions, backlog
    ADD-A-FEATURE.md       step-by-step recipe with a checklist
  src/
    config/                1  constants: env, routes, roles
    api/                   2  talks to the backend (HTTP only, no React)
    queries/               3  shared server-state hooks + cache keys
    auth/                  4  who is signed in
    shared/                5  generic UI, hooks, helpers
    features/              6  screens, one folder per business area
    app/                   7  wiring: providers, router, layouts, guards
    test/                     test setup and helpers
    styles/                   global CSS (variables, dark mode)
    main.tsx                  entry point
  eslint.config.js         the architecture rules live here
```

Every numbered folder has its own `README.md` with more detail.

## 4. The one rule that keeps the code clean

**A layer may only import from layers below it.**

```
app/              (7)  may import everything
  features/       (6)  may import shared, auth, queries, api, config   -- NEVER another feature
    shared/       (5)  may import config                               -- NEVER api, features, app
    auth/         (4)  may import api, config
    queries/      (3)  may import api, config                          -- NEVER features, app
      api/        (2)  may import config                               -- NEVER React, features, UI
        config/   (1)  imports nothing from src
```

`npm run lint` fails when the rule is broken, so you cannot merge a violation by accident.
If you feel you need to break the rule, you have put code in the wrong layer. Ask in the team channel before you work around it.

---

## 5. The layers in detail

### Layer 1: `src/config/` (configuration)
**Job:** hold constants that describe the app. No logic, no React, no HTTP.

| File | Contents | Use it like |
|---|---|---|
| `env.ts` | The only place that reads `import.meta.env`. Stops the app at start-up if `VITE_API_BASE_URL` is missing. | `env.apiBaseUrl` |
| `routes.ts` | Every URL path of the app. | `navigate(routes.students)` |
| `roles.ts` | Role names and role groups (`RoleGroups.SchoolSetup` ...). They mirror the API's groups. | `hasRole(...RoleGroups.StudentAdmission)` |

**Do:** add the path to `routes.ts` before you create a page.
**Don't:** type `'/students'` or `'Principal'` as a string anywhere else. Never put secrets in env variables: everything starting with `VITE_` is visible to anyone who opens the site.

### Layer 2: `src/api/` (data access)
**Job:** the only code that talks to the server. Turns HTTP into typed functions.

| Part | Job |
|---|---|
| `httpClient.ts` | One axios instance. Adds `Authorization: Bearer ...`, adds `X-Tenant` for Super Admin support mode, and on a `401` renews the token **once** (refresh tokens are single-use, so parallel failures share one refresh call) and retries. If renewing fails it signs the user out. |
| `apiError.ts` | Converts any failure (server error body, plain text, network down) into one `ApiError` with `message`, `status`, `fieldErrors`, `reference`. Components never touch `AxiosError`. |
| `tokenStorage.ts` | Where tokens live (`sessionStorage`). The only file that reads or writes them. |
| `endpoints/*.ts` | One file per API controller. Each function = one HTTP call, returns the data (already unwrapped). |
| `types/*.ts` | TypeScript shapes of request and response bodies. They mirror the server's DTOs. |
| `index.ts` | The public surface: `import { studentsApi } from '@/api'`. |

```ts
// endpoints/students.ts
paged: async (page: number, pageSize: number) =>
  (await httpClient.get<Paged<Student>>('/api/Student/paged', { params: { page, pageSize } })).data,
```

**Do:** when the API changes, update `types/` first and let the compiler show what breaks.
**Don't:** import React, hooks, or anything from `features/` here. Don't put business decisions in endpoint functions. Don't call `axios` directly from anywhere else.

### Layer 3: `src/queries/` (shared server state)
**Job:** React Query hooks for data that **more than one feature** reads (branches, academic years, classes, divisions, lookups), plus **all cache keys** in `queryKeys.ts`.

Why it exists: features may not import each other. If Students needs the branch list for a dropdown, it cannot import the Branches feature, so both import `@/queries`.

```ts
export const useBranches = () => useQuery({ queryKey: queryKeys.branches, queryFn: branchesApi.list });
```

**Do:** keep hooks here read-only (`useQuery`). Give rarely-changing lookups a `staleTime`.
**Don't:** put mutations here (they stay in the feature that owns the screen). Don't write a query key array inline in a component.

### Layer 4: `src/auth/` (session)
**Job:** who is signed in and what role they have. App-wide state.

| File | Job |
|---|---|
| `jwt.ts` | Reads email, name, roles and school group from the access token **for display only**. The server is what validates tokens. |
| `authContext.ts` | The context type and the `useAuth()` hook. |
| `AuthProvider.tsx` | `signIn`, `signOut`, support-mode switch. Clears the query cache on sign-out and on school-group switch so one school's data never shows to another session. |

```tsx
const { user, hasRole, isSuperAdmin, signOut } = useAuth();
{hasRole(...RoleGroups.SchoolSetup) && <Button>New branch</Button>}
```

**Remember:** hiding a button is **not** security. The API answers `403` to forbidden calls; the UI hides actions only so users are not offered things that will fail.

### Layer 5: `src/shared/` (reusable building blocks)
**Job:** generic UI, hooks and helpers any feature can use. It knows nothing about students or branches.

| Folder | Contents |
|---|---|
| `ui/` | `Button`, `TextField`, `SelectField`, `DataTable`, `Alert`, `Card`, `PageHeader`, `Spinner`, `StatusBadge`, `QueryState` |
| `hooks/` | `useDebouncedValue` |
| `utils/` | `formatDate`, `blankToUndefined`, `nameLookup` |

**Do:** make input components `forwardRef` so `react-hook-form`'s `register()` works. Style with the CSS variables in `styles/global.css` so dark mode works. Keep components presentational: data arrives through props.
**Don't:** import `@/api`, `@/features` or `@/app` here (lint blocks it). Don't move something here until a **second** feature needs it; build it inside the feature first.

### Layer 6: `src/features/` (screens and use cases)
**Job:** everything a user can **do**. One folder per business area. Most of your daily work happens here.

```
features/students/
  index.ts          public surface: only the pages that app/router.tsx needs
  pages/            one component per route; thin, composes hooks and components
  components/       pieces used only by this feature
  hooks/            React Query hooks owned by this feature (mutations, feature-only queries)
```

Existing features: `login`, `dashboard`, `school-groups`, `branches`, `academic-years`, `classes`, `students`.
`academic-years` is the smallest complete example: copy it when you start a new one.

**Do:** use `react-hook-form` + `zod` for every form; handle loading, error, empty and data states (`QueryState` + `DataTable` give you this); invalidate the right query key after a mutation; show `toApiError(e).message` on failure.
**Don't:** import another feature (lint blocks it); fetch inside a page with raw `useEffect`; copy server data into `useState`.

### Layer 7: `src/app/` (composition root)
**Job:** wire everything together. The only layer allowed to import from all others.

| File | Job |
|---|---|
| `App.tsx` | Providers in order: ErrorBoundary > QueryClient > Router > Auth. Global query defaults (no retry on 4xx). |
| `router.tsx` | The route table. Every page is `lazy()`-loaded, so each feature is its own JavaScript file. |
| `guards.tsx` | `ProtectedRoute` (must be signed in) and `RoleRoute` (must hold one of the roles). |
| `layouts/AppLayout.tsx` | Signed-in shell: role-aware navigation, user box, sign-out, "leave school group". |
| `layouts/AuthLayout.tsx` | Centered shell for the login page. |
| `ErrorBoundary.tsx` | A friendly screen instead of a white page when rendering crashes. |

**Don't:** put business logic or API calls here.

### Support folders
- `src/test/`: `setup.ts` (jest-dom, cleanup) and `renderWithProviders.tsx` (fresh query cache + router for component tests).
- `src/styles/global.css`: design tokens as CSS variables (colours, spacing, radius) with a dark-mode block, plus the small set of shared classes.

---

## 6. How one request flows through the layers

Example: the Students list.

```
StudentsPage                  (features)  draws the table, shows spinner / error / empty text
  -> useStudentsPage          (features)  React Query: cache, loading flags, keeps the old page while loading the next
    -> studentsApi.paged      (api)       one typed function: GET /api/Student/paged?page=1&pageSize=20
      -> httpClient           (api)       adds Bearer token + X-Tenant, renews the token on 401
        -> the API
      <- toApiError           (api)       any failure becomes one ApiError with a user-safe message
```

Creating something goes the other way: form (zod validates) -> mutation hook -> endpoint function -> API; on success the hook invalidates the list's query key, and the list reloads by itself.

## 7. Key concepts you must understand

**Multi-tenancy.** The backend has one database per **school group** (the tenant). A school group has many **branches**. A normal user's token already says which group they belong to, so the front end does nothing special. The **Super Admin has no group**; to work inside one they press **Open**, the app stores its identifier ("support mode") and sends `X-Tenant: <identifier>` on every call. Pages that need a group tell a Super Admin to open one first.

**Roles.** Thirteen fixed roles (SuperAdmin, GroupAdmin, BranchAdmin, Principal, ...). The API decides access; `config/roles.ts` mirrors its groups so the UI can hide actions. If you add an API rule, add the matching group there.

**State, and where it lives.**

| Kind of state | Tool | Example |
|---|---|---|
| Data from the server | **React Query** (the only cache) | students, branches |
| Who is signed in | `useAuth()` | user, roles, support tenant |
| Form fields and errors | react-hook-form + zod | admission form |
| Small local UI state | `useState` | "show form", current page number |
| Which page | React Router (the URL) | `/students` |

**Dates.** The API sends and expects date-only values as `"YYYY-MM-DD"` strings. Keep them as strings; display with `formatDate`. Never build a `Date` from them by hand (time zones shift the day).

**Optional fields.** The API treats `""` as a value. Send `undefined` for empty optional inputs (`blankToUndefined`).

**Errors.** The server returns a JSON body (`UserMessage`, `ValidationMessage`, `Errors`, `ReferenceId`) or plain text for login failures. `toApiError` handles both. If a user reports a problem, ask for the `reference` shown with the error: the backend team can find it in the logs.

## 8. Rules every developer must follow

### Architecture
1. Respect the import direction in section 4. Lint will tell you when you slip.
2. One job per file. A page composes; a hook fetches; an endpoint function makes one call.
3. Import a feature only through its `index.ts`, and only from `app/`.
4. Use the `@/` alias for anything outside the current folder; use relative imports inside a feature.
5. Move code to `shared/` or `queries/` only when a second feature needs it.

### TypeScript
6. No `any`. Use `unknown` and narrow it. No `// @ts-ignore`.
7. Model what the API really returns, including `null`. Don't invent fields.
8. Let the compiler find breakage: change `api/types` first, then fix errors.

### React
9. Components are small functions; extract when a file passes about 150 lines.
10. Never fetch with `useEffect`; use React Query hooks.
11. Never store server data in `useState`; read it from the query.
12. Give list items a stable `key` (the id), never the array index.
13. Don't use `dangerouslySetInnerHTML` with user data (tokens are readable by scripts, so XSS is serious).

### Forms
14. react-hook-form + a zod schema. Mirror the server rules (required, lengths, date order) for fast feedback; the server still validates.
15. Disable the submit button while submitting (`loading` prop on `Button`); show the server message on failure.

### Data and API
16. All HTTP goes through `src/api`. All cache keys come from `queryKeys`.
17. After any mutation, invalidate the affected keys.
18. Never log or store passwords or tokens outside `tokenStorage`.
19. No secrets in `.env` files that are committed: `VITE_*` values are public.

### UX and accessibility
20. Every list handles loading, error, empty and data.
21. Every input has a visible label; errors use `role="alert"`; everything works with the keyboard.
22. Use the CSS variables, never hard-coded colours, so dark mode keeps working.
23. Show friendly messages. Never show stack traces or raw exceptions.

### Code style
24. Names: components `PascalCase.tsx`, hooks `useThing.ts`, API objects `thingApi`, constants `camelCase`.
25. Comment the **why**, not the what. No commented-out code, no `console.log` (only the ErrorBoundary may log).
26. Run `npm run format` before committing.

## 9. Daily workflow

1. Pull the latest `main`, then branch: `git checkout -b feature/short-description`.
2. Read the API contract (Swagger at `http://localhost:5102/swagger`, or the API repo's TestGuide).
3. Build in layer order: **types -> endpoint -> key/route -> hook -> page -> router/nav**. The full recipe with a worked example is in [docs/ADD-A-FEATURE.md](docs/ADD-A-FEATURE.md).
4. Check the screen by hand: loading, empty, error (stop the API), validation messages, and a role that must **not** see it.
5. Run the four gates:
   ```
   npm run typecheck && npm run lint && npm test && npm run build
   ```
6. Commit in small steps with clear messages (`Add subjects list and create form`). Open a pull request describing **what** changed and **how you tested it**; add a screenshot for UI changes.
7. Address review comments, then merge. Don't merge with a failing gate.

**What to test:** pure logic first (helpers, schemas, `jwt`, `apiError`), then components by what the user sees (`getByRole`, `getByLabelText`), then pages with the **api layer mocked** (`vi.mock('@/api')`). Details in [src/test/README.md](src/test/README.md).

## 10. Definition of done

- [ ] Works for the intended roles and is hidden (and refused by the API) for others
- [ ] Loading, empty, error and success states all handled
- [ ] Form validation messages are clear; the server error message is shown on failure
- [ ] No hard-coded paths, role names or query keys
- [ ] Mutations invalidate the right query keys
- [ ] No `any`, no `console.log`, no secrets
- [ ] Labels on all inputs; usable by keyboard; works in dark mode
- [ ] Tests added for new logic; `typecheck`, `lint`, `test`, `build` all pass
- [ ] This documentation updated if you changed a convention

## 11. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| White page, console says `Missing environment variable VITE_API_BASE_URL` | Create `.env.local` from `.env.example` and restart `npm run dev`. |
| `Cannot reach the server` | API not running, or wrong URL in `.env.local`. Check `http://localhost:5102/swagger`. |
| Browser console shows a CORS error | The API only allows `localhost` origins in Development. Run it with the `http` profile, and use `localhost`, not another host name. |
| Super Admin sees "Open a school group first" | Expected: go to School groups and press **Open** (this sends `X-Tenant`). |
| Everything returns 401 right after login | Clock or token problem on the API; sign out and in again. If it persists, check the API's JWT settings. |
| `403` on a button that seems allowed | The UI role group and the API role group differ. Fix `config/roles.ts` to match the controller's `[Authorize(Roles = ...)]`. |
| Lint error `import is restricted by a pattern` | You broke the layer rule (section 4). Move the code to the correct layer. |
| A list does not refresh after saving | The mutation does not invalidate the right `queryKeys` entry. |
| A date shows one day earlier | A `Date` was built from `"YYYY-MM-DD"` by hand. Use `formatDate`. |

## 12. Further reading and backlog

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): diagrams, security notes, conventions, backlog.
- [docs/ADD-A-FEATURE.md](docs/ADD-A-FEATURE.md): the step-by-step recipe.
- Layer READMEs: [config](src/config/README.md), [api](src/api/README.md), [queries](src/queries/README.md), [auth](src/auth/README.md), [shared](src/shared/README.md), [features](src/features/README.md), [app](src/app/README.md), [test](src/test/README.md).

**Good first tasks for a new developer:**
1. Subjects screen (copy `academic-years`).
2. Student detail page and the suspend / activate actions (`studentsApi` already has both).
3. A component test for `LoginPage` with the api layer mocked.
4. Staff list and create form.
