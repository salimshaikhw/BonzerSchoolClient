# shared/ (layer 4: reusable building blocks)

**Purpose:** generic UI components, hooks and helpers that any feature can use. Nothing here knows about students, branches or the API.

```
shared/
  ui/       Button, TextField, SelectField, DataTable, Alert, Card, PageHeader, Spinner, QueryState
  hooks/    useDebouncedValue ...
  utils/    formatDate, blankToUndefined, nameLookup ...
```

## Rules
1. **No business knowledge.** If a component mentions "student" or imports from `@/api`, it belongs in a feature. ESLint blocks imports of `features/`, `app/` and `api/` from here.
2. **Presentational components receive data through props**; they do not fetch.
3. Components that wrap a native input must `forwardRef`, so `react-hook-form`'s `register()` works.
4. Style with the CSS variables in `styles/global.css` (supports dark mode). Do not hard-code colours.
5. Accessibility is part of "done": labels tied to inputs, `role="alert"` on errors, keyboard-usable controls.
6. Anything non-trivial needs a unit test next to it (see `utils/format.test.ts`).

## When to add something here
Build it inside the feature first. Move it to `shared/` only when a **second** feature needs it.
