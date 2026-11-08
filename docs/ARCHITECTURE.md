# Front-end architecture

React 18 + TypeScript (strict) + Vite. A single-page app that calls the Bonzer School REST API.

## 1. Layers and the dependency rule

```
            app/            composition root: providers, router, layouts, guards
              |
          features/         screens and use cases (login, students, branches ...)
              |
   +----------+-----------+
   |          |           |
 queries/   auth/       shared/        shared server state | session | generic UI, hooks, utils
   |          |
   +-----+----+
         |
        api/                typed HTTP client + endpoint functions + DTO types
         |
      config/               env, routes, roles
```

**A layer may import only from layers below it.** Two extra rules:
- features never import other features;
- `api/` and `shared/` never import React feature code.

ESLint enforces these (`eslint.config.js`), so a wrong import fails `npm run lint` and CI.

| Layer | Folder | Doc |
|---|---|---|
| Configuration | `src/config` | [README](../src/config/README.md) |
| Data access | `src/api` | [README](../src/api/README.md) |
| Shared server state | `src/queries` | [README](../src/queries/README.md) |
| Session | `src/auth` | [README](../src/auth/README.md) |
| Shared UI / utils | `src/shared` | [README](../src/shared/README.md) |
| Features | `src/features` | [README](../src/features/README.md) |
| App shell | `src/app` | [README](../src/app/README.md) |
| Tests | `src/test` | [README](../src/test/README.md) |

## 2. How a request flows (example: "list students")

```
StudentsPage            renders table, handles loading/error (QueryState)
  -> useStudentsPage    React Query hook (cache, loading flags, keepPreviousData)
    -> studentsApi.paged   one typed function: GET /api/Student/paged?page=1&pageSize=20
      -> httpClient       adds Bearer token + X-Tenant header, refreshes the token on 401
        -> API            returns JSON (or an error body)
      <- toApiError       any failure becomes one ApiError with a user-safe message
```

## 3. State: where does data live?

| Kind | Tool | Example |
|---|---|---|
| Server data (lists, records) | **React Query** | students, branches |
| Session (who am I) | React context (`auth/`) | user, roles, support tenant |
| Form state | **react-hook-form** + **zod** | admission form |
| Local UI state | `useState` | "show form" toggle, current page |
| URL state | React Router | which page you are on |

Do **not** copy server data into `useState` or a global store; React Query is the single cache.

## 4. Multi-tenancy (important to understand)

The backend has one database per **school group** (the tenant). The JWT carries the group, so for normal users the front end does nothing special.

The **Super Admin has no school group.** To work inside one, the UI stores its identifier ("support mode") and `httpClient` sends `X-Tenant: <identifier>` on every call. Switching group clears the React Query cache so data never leaks between groups. Sign-out clears it too.

## 5. Security notes
- Role checks in the UI are cosmetic. The API returns 403 for anything not allowed.
- Tokens are in `sessionStorage` (cleared when the tab closes). It is readable by scripts, so **never render unsanitised HTML** (no `dangerouslySetInnerHTML` with user data). Moving the refresh token to an httpOnly cookie needs an API change; discuss with the backend team before production.
- No secrets in `VITE_*` variables: they are public.
- Passwords are never logged or stored.

## 6. Conventions
- **Naming:** components `PascalCase.tsx`; hooks `useThing.ts`; API objects `thingApi`; query keys in `queries/queryKeys.ts`.
- **Types:** `strict` mode, `noUncheckedIndexedAccess` on. No `any`; use `unknown` and narrow.
- **Imports:** use the `@/` alias for anything outside the current folder. Import a feature only through its `index.ts`.
- **Styling:** plain CSS with variables in `styles/global.css` (supports dark mode). Add a CSS-modules or Tailwind decision as an ADR if the team wants one.
- **Dates:** the API uses `YYYY-MM-DD` strings for date-only values; keep them as strings and format with `formatDate`.
- **Accessibility:** every input has a label, errors use `role="alert"`, controls work with the keyboard.
- **Performance:** routes are lazy-loaded; lists are paged by the server; lookups have a `staleTime`.

## 7. Quality gates (run before every pull request)
```
npm run typecheck
npm run lint
npm test
npm run build
```
Recommended CI: run the four commands on every pull request and block merging on failure.

## 8. Known gaps / next steps (backlog for the team)
- Screens still missing: staff, subjects and class-subject mapping, fees, exams, attendance, timetable, parent link, student lifecycle actions (suspend / promote / transfer), bulk upload, analytics.
- End-to-end tests (Playwright) against a seeded API.
- A generated API client from the Swagger/OpenAPI file, to replace the hand-written `api/types`.
- Error reporting (Sentry/Datadog RUM) in `ErrorBoundary.componentDidCatch`.
- Internationalisation if more than one language is needed.
- Decide on a design system / component library.
