# api/ (layer 2: data access)

**Purpose:** the only code that talks to the backend. It turns HTTP into typed TypeScript functions.
No React in here: no components, no hooks.

```
api/
  httpClient.ts    one axios instance: base URL, auth header, X-Tenant header, 401 -> refresh -> retry
  apiError.ts      turns any failure into one ApiError (message, status, field errors, reference id)
  tokenStorage.ts  where the session tokens are kept
  endpoints/       one file per API controller: plain async functions, e.g. studentsApi.paged(page, size)
  types/           TypeScript shapes of the API's request/response bodies
  index.ts         the public surface: import { studentsApi } from '@/api'
```

## Rules
1. **Endpoint functions return data, not axios responses** (`.data` is unwrapped here).
2. **One function = one HTTP call.** Business decisions belong in features.
3. **Types mirror the server DTOs** in `Application/ViewModels/*`. When the API changes, change `types/` first, then let the compiler show what breaks.
4. **Errors:** never catch `AxiosError` in a component. The interceptor converts everything to `ApiError`.
5. **Do not import React, `features/` or `shared/ui` here.** ESLint enforces it.

## How the token refresh works
- Every request gets `Authorization: Bearer <accessToken>`.
- On a `401` the client calls `POST /api/Auth/refresh` **once** (refresh tokens are single-use, so parallel 401s share one call), then retries the original request.
- If the refresh fails, the tokens are cleared and the registered handler signs the user out.

## Super Admin "support mode"
A Super Admin has no school group. To work inside one, the header `X-Tenant: <identifier>` is sent.
`tokenStorage.setSupportTenant(identifier)` switches it on; the interceptor adds the header.

## Adding an endpoint
1. Add or adjust the type in `types/`.
2. Add a function in the matching `endpoints/*.ts` file (a new controller means a new file).
3. Export it from `index.ts`.
4. Use it from a feature hook (see `features/README.md`).
