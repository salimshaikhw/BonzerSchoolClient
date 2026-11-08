import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { toApiError } from './apiError';
import { tokenStorage } from './tokenStorage';
import type { TokenPair } from './types/auth';

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

/** Called when the session cannot be renewed. The auth layer registers a handler (sign out + go to login). */
let onSessionExpired: () => void = () => undefined;
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

// ---- request: attach the access token and, for a Super Admin in support mode, the X-Tenant header ----
httpClient.interceptors.request.use((config) => {
  const tokens = tokenStorage.get();
  if (tokens) config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  const tenant = tokenStorage.getSupportTenant();
  if (tenant) config.headers.set('X-Tenant', tenant);
  return config;
});

// ---- response: on 401 refresh the token once (single-flight), retry, otherwise sign out ----
type RetriableRequest = InternalAxiosRequestConfig & { _retried?: boolean };
let refreshing: Promise<TokenPair> | null = null;

async function refreshTokens(): Promise<TokenPair> {
  const current = tokenStorage.get();
  if (!current) throw new Error('No session');
  // Plain axios (not httpClient) so this call skips the interceptors and cannot loop.
  const { data } = await axios.post<TokenPair>(`${env.apiBaseUrl}/api/Auth/refresh`, {
    refreshToken: current.refreshToken,
  });
  tokenStorage.set(data);
  return data;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined;
    const isAuthCall = original?.url?.includes('/api/Auth/');

    if (error.response?.status === 401 && original && !original._retried && !isAuthCall && tokenStorage.get()) {
      original._retried = true;
      try {
        // Refresh tokens are single use: concurrent 401s must share ONE refresh call.
        refreshing ??= refreshTokens().finally(() => (refreshing = null));
        const tokens = await refreshing;
        original.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
        return httpClient(original);
      } catch {
        tokenStorage.clear();
        onSessionExpired();
      }
    }
    return Promise.reject(toApiError(error));
  },
);
