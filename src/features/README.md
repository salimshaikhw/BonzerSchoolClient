# features/ (layer 5: screens and use cases)

**Purpose:** everything a user can *do*, one folder per business area. This is where most day-to-day work happens.

```
features/
  login/          sign-in page
  dashboard/      landing page
  school-groups/  Super Admin: create / (de)activate school groups, open one in support mode
  branches/       list + create branches
  academic-years/ list + create academic years
  classes/        classes and divisions
  students/       paged list + admission form
```

## Anatomy of a feature
```
features/students/
  index.ts            public surface: only what app/router.tsx needs (the pages)
  pages/              one component per route; composes components and hooks
  components/         pieces used only by this feature
  hooks/              React Query hooks owned by this feature (mutations, feature-only queries)
```

## Rules
1. **A feature never imports another feature.** ESLint fails the build if you try. If two features need the same thing:
   - server data (a list for dropdowns) -> `src/queries/`
   - UI or helper -> `src/shared/`
2. **Pages are thin.** Fetching goes in a hook, HTTP in `src/api`, layout in components.
3. **Forms** = `react-hook-form` + a `zod` schema. The schema repeats the API's validation rules so users get instant feedback; the server still validates everything. Convert blank strings with `blankToUndefined` before sending.
4. **Every list page handles four states:** loading, error, empty, data (`QueryState` + `DataTable` do this).
5. **After a mutation, invalidate** the affected `queryKeys`, otherwise the list stays stale.
6. **Permissions in the UI** use `hasRole(...RoleGroups.X)` to hide buttons, and `RoleRoute` in the router to hide pages. The API is still the real gatekeeper.
7. **Show `ApiError.message`** to the user (`toApiError(e).message`). Never show raw exceptions or stack traces.

## Add a new feature
See [docs/ADD-A-FEATURE.md](../../docs/ADD-A-FEATURE.md).
