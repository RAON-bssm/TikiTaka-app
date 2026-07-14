import type { ApiResponse } from '@/types/api';
import type { LoginData, Provider } from '@/types/auth';
import client from './client';

export async function login(provider: Provider, authorizationCode: string): Promise<LoginData> {
  const { data } = await client.post<ApiResponse<LoginData>>(`/api/login/${provider}`, {
    authorization_code: authorizationCode,
  });
  return data.data;
}
