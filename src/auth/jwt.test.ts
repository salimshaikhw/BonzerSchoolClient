import { parseAccessToken } from './jwt';

function makeToken(claims: Record<string, unknown>): string {
  const encode = (o: unknown) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256' })}.${encode(claims)}.signature`;
}

describe('parseAccessToken', () => {
  it('reads email, roles, tenant and expiry', () => {
    const user = parseAccessToken(makeToken({ email: 'a@b.test', name: 'Asha', role: ['GroupAdmin', 'Wizard'], tenant: 'sunrise-trust', exp: 2_000_000_000 }));
    expect(user).toMatchObject({ email: 'a@b.test', name: 'Asha', roles: ['GroupAdmin'], tenant: 'sunrise-trust', expiresAt: 2_000_000_000_000 });
  });

  it('accepts a single role string and the long Microsoft claim name', () => {
    const user = parseAccessToken(makeToken({ 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'SuperAdmin' }));
    expect(user?.roles).toEqual(['SuperAdmin']);
    expect(user?.tenant).toBeNull();
  });

  it('returns null for garbage', () => {
    expect(parseAccessToken('nope')).toBeNull();
  });
});
