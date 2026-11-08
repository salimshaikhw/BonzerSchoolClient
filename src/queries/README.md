# queries/ (layer 3b: shared server state)

**Purpose:** React Query hooks for data that **more than one feature** reads (branches, academic years, classes, divisions, lookups), plus the central `queryKeys`.

Why a separate layer? Features may not import each other. If `students` needs the list of branches, it cannot import `features/branches`. Both import `@/queries` instead.

## Rules
- Hooks here are **read-only** (`useQuery`). Mutations stay in the feature that owns the screen and invalidate the key afterwards:
  ```ts
  queryClient.invalidateQueries({ queryKey: queryKeys.branches });
  ```
- Add keys to `queryKeys.ts`; never write a key array inline in a component.
- Data used by only one feature stays in that feature's `hooks/` folder.
- Lookups that rarely change get a `staleTime`, so dropdowns do not refetch on every page.
