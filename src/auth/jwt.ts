import { Roles, type Role } from '@/config/roles';

export interface SessionUser {
  email: string;
  name: string;
  roles: Role[];
  /** School group identifier; null for the Super Admin. */
  tenant: string | null;
  expiresAt: number;
}

const ROLE_CLAIMS = ['role', 'roles', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
const EMAIL_CLAIMS = ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress', 'sub'];
const NAME_CLAIMS = ['name', 'unique_name', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

const knownRoles = new Set<string>(Object.values(Roles));

function firstString(claims: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === 'string' && value) return value;
  }
  return undefined;
}

/** Reads the display data out of the access token. This is NOT a security check: the server validates the token. */
export function parseAccessToken(token: string): SessionUser | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    const claims = JSON.parse(json) as Record<string, unknown>;

    const rawRoles = ROLE_CLAIMS.map((k) => claims[k]).find((v) => v !== undefined);
    const roleList = Array.isArray(rawRoles) ? rawRoles : rawRoles ? [rawRoles] : [];
    const roles = roleList.filter((r): r is Role => typeof r === 'string' && knownRoles.has(r));

    const email = firstString(claims, EMAIL_CLAIMS) ?? '';
    return {
      email,
      name: firstString(claims, NAME_CLAIMS) ?? email,
      roles,
      tenant: firstString(claims, ['tenant']) ?? null,
      expiresAt: typeof claims.exp === 'number' ? claims.exp * 1000 : 0,
    };
  } catch {
    return null;
  }
}
