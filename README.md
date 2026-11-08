# Bonzer School: web client

React 18, TypeScript (strict), Vite, React Router, TanStack Query, react-hook-form + zod, axios, Vitest.

## Run it

1. Start the API (see the repo `TestGuide/01-School-Setup-Hierarchy.md`, Part A). It listens on `http://localhost:5102`.
2. Then:
   ```
   cd web
   npm install
   cp .env.example .env.local     # adjust VITE_API_BASE_URL if needed
   npm run dev                    # http://localhost:5173
   ```
   The API allows CORS from `localhost` in Development.
3. Sign in as `superadmin@bonzer.local` / `Admin@123` (Development), create a school group, press **Open**, then continue with branches, academic years, classes, students. Or sign in as a Group Admin created by the API.

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check + production build into `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint, including the architecture rules |
| `npm test` | Unit and component tests (once) |
| `npm run format` | Prettier |

## Where to read next
1. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): the layers, the dependency rule, data flow, conventions.
2. One README per layer, in order: [config](src/config/README.md), [api](src/api/README.md), [queries](src/queries/README.md), [auth](src/auth/README.md), [shared](src/shared/README.md), [features](src/features/README.md), [app](src/app/README.md), [test](src/test/README.md).
3. [docs/ADD-A-FEATURE.md](docs/ADD-A-FEATURE.md): step-by-step recipe with a checklist.

## What exists today
Login (with automatic token refresh), role-aware navigation, school groups (Super Admin, support mode), branches, academic years, classes and divisions, students (paged list and admission form).
The remaining modules (fees, exams, attendance, timetable, staff ...) are listed in the backlog at the end of the architecture doc.
