import type { TokenPair } from './types/auth';

/**
 * Where the session tokens live. One module, so the storage choice can change in one place.
 * sessionStorage: cleared when the tab closes. (The most secure option is an httpOnly cookie set by the
 * server; that needs an API change, see docs/ARCHITECTURE.md "Security".)
 */
const KEY = 'bonzer.tokens';
const TENANT_KEY = 'bonzer.supportTenant';

export const tokenStorage = {
  get(): TokenPair | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as TokenPair) : null;
    } catch {
      return null;
    }
  },
  set(tokens: TokenPair): void {
    sessionStorage.setItem(KEY, JSON.stringify(tokens));
  },
  clear(): void {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(TENANT_KEY);
  },

  /** Super Admin only: the school group identifier sent as the X-Tenant header. */
  getSupportTenant(): string | null {
    return sessionStorage.getItem(TENANT_KEY);
  },
  setSupportTenant(identifier: string | null): void {
    if (identifier) sessionStorage.setItem(TENANT_KEY, identifier);
    else sessionStorage.removeItem(TENANT_KEY);
  },
};
