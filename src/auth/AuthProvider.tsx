import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, setSessionExpiredHandler, tokenStorage } from '@/api';
import { Roles, type Role } from '@/config/roles';
import { AuthContext, type AuthContextValue } from './authContext';
import { parseAccessToken, type SessionUser } from './jwt';

function readSession(): SessionUser | null {
  const tokens = tokenStorage.get();
  return tokens ? parseAccessToken(tokens.accessToken) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<SessionUser | null>(readSession);
  const [supportTenant, setSupportTenantState] = useState<string | null>(tokenStorage.getSupportTenant);

  const reset = useCallback(() => {
    tokenStorage.clear();
    queryClient.clear(); // never show one school's cached data to the next user
    setUser(null);
    setSupportTenantState(null);
  }, [queryClient]);

  // The http client calls this when a refresh fails: drop the session and let the router redirect.
  useEffect(() => {
    setSessionExpiredHandler(reset);
  }, [reset]);

  const signIn = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login({ email, password });
    tokenStorage.set(tokens);
    setUser(parseAccessToken(tokens.accessToken));
  }, []);

  const signOut = useCallback(async () => {
    const tokens = tokenStorage.get();
    reset();
    if (tokens) await authApi.revoke(tokens.refreshToken).catch(() => undefined);
  }, [reset]);

  const setSupportTenant = useCallback(
    (identifier: string | null) => {
      tokenStorage.setSupportTenant(identifier);
      setSupportTenantState(identifier);
      queryClient.clear(); // different school group, different data
    },
    [queryClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      supportTenant,
      hasRole: (...roles: readonly Role[]) => !!user && user.roles.some((r) => roles.includes(r)),
      isSuperAdmin: !!user && user.roles.includes(Roles.SuperAdmin),
      signIn,
      signOut,
      setSupportTenant,
    }),
    [user, supportTenant, signIn, signOut, setSupportTenant],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
