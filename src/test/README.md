# test/ (testing utilities)

Tools: **Vitest** (runner) + **React Testing Library** (renders components like a user sees them) + **jsdom**.

| File | Role |
|---|---|
| `setup.ts` | Loaded before every test: jest-dom matchers, automatic cleanup. |
| `renderWithProviders.tsx` | Renders a component inside a fresh `QueryClient` and a router. |

## Where tests live
Next to the code: `format.ts` -> `format.test.ts`, `Button.tsx` -> `Button.test.tsx`.

## What to test (pyramid)
1. **Pure logic first:** `utils/`, `auth/jwt.ts`, `api/apiError.ts`. Fast, no rendering.
2. **Components:** assert on what the user sees (`getByRole`, `getByLabelText`), not on implementation details.
3. **Pages with data:** mock the **api layer** (`vi.mock('@/api')`), never axios internals, and render with `renderWithProviders`.
4. End-to-end (Playwright) is the next step once the API runs in CI; it is not set up yet.

## Commands
```
npm test            run once (CI)
npm run test:watch  re-run on change
```
