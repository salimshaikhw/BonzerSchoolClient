# app/ (layer 6: composition root)

**Purpose:** wires everything together. It is the only layer allowed to import from every other layer.

| File | Role |
|---|---|
| `App.tsx` | Providers in the right order: ErrorBoundary > QueryClient > Router > Auth. Also the global React Query defaults (no retry on 4xx). |
| `router.tsx` | The route table. Every page is `lazy()`-loaded so each feature is its own JavaScript chunk. |
| `guards.tsx` | `ProtectedRoute` (must be signed in) and `RoleRoute` (must have one of the roles). |
| `layouts/AppLayout.tsx` | Signed-in shell: navigation, user box, sign-out, "leave school group" for Super Admins. |
| `layouts/AuthLayout.tsx` | Centered shell for the login page. |
| `ErrorBoundary.tsx` | Shows a friendly screen instead of a white page when rendering crashes. |

## Rules
- No business logic and no API calls here.
- Paths come from `config/routes.ts`; role lists from `config/roles.ts`.
- New page = new `lazy()` import + `<Route>`; wrap it in `RoleRoute` if only some roles may open it.
- Navigation links that depend on role live in `AppLayout`.
