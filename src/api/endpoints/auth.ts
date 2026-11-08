import { httpClient } from '../httpClient';
import type { LoginRequest, RegisterUserRequest, TokenPair } from '../types/auth';

export const authApi = {
  login: async (body: LoginRequest) => (await httpClient.post<TokenPair>('/api/Auth/login', body)).data,
  revoke: async (refreshToken: string) => {
    await httpClient.post('/api/Auth/revoke', { refreshToken });
  },
  registerUser: async (body: RegisterUserRequest) => (await httpClient.post('/api/User/register', body)).data,
};
