# config/ (layer 1: configuration)

**Purpose:** constants that describe the app but contain no logic: environment variables, route paths, role names.

| File | What it holds |
|---|---|
| `env.ts` | The only reader of `import.meta.env`. Fails fast at start-up if `VITE_API_BASE_URL` is missing. |
| `routes.ts` | Every URL path. Use `routes.students`, never the string `'/students'`. |
| `roles.ts` | Role names and role groups. They mirror the API's `RoleGroups`; the UI uses them only to hide buttons and menu items. **The server is the real authority.** |

## Rules
- Imports nothing from the rest of `src/`. Every other layer may import from here.
- No secrets. Anything in a front-end bundle is public.
- Adding a page? Add its path to `routes.ts` first.
