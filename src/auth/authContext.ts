import { createContext, useContext } from 'react';
import type { Role } from '@/config/roles';
import type { SessionUser } from './jwt';

export interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  /** Super Admin only: the school group being supported (sent as X-Tenant). */
  supportTenant: string | null;
  /** True when the user has at least one of the roles. UI convenience only, the server enforces access. */
  hasRole: (...roles: readonly Role[]) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSupportTenant: (identifier: string | null) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
