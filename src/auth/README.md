# auth/ (layer 3: session)

**Purpose:** who is signed in, and what may they see. App-wide state shared by every feature.

| File | Role |
|---|---|
| `jwt.ts` | Reads the display data (email, roles, school group) from the access token. **Not a security check**; the server validates every token. |
| `authContext.ts` | The context type and the `useAuth()` hook. |
| `AuthProvider.tsx` | Holds the session: `signIn`, `signOut`, support-mode switch. Registers the "session expired" handler on the http client. |

## Using it
```tsx
const { user, hasRole, isSuperAdmin, signOut } = useAuth();
if (hasRole(...RoleGroups.SchoolSetup)) { /* show the "Add branch" button */ }
```

## Rules
- **Hiding a button is not security.** The API returns 403 for forbidden calls; the UI hides things only so users are not shown actions that fail.
- On sign-out and on tenant switch we **clear the React Query cache**, so one school's data is never shown to the next session.
- Tokens are stored through `api/tokenStorage.ts` only, never touched directly by components.
- Pages never import `AuthProvider`; they use `useAuth()`.
- Route protection is in `app/` (`ProtectedRoute`, `RoleRoute`).
