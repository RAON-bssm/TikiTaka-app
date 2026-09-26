import type { ApiResponse } from '@/types/api';
import type { LoginData, Provider, SignupRequest, TokenData } from '@/types/auth';
import client from './client';

export { reissue } from './refresh';

/** 응답 `status`로 분기한다: 'LOGIN'이면 토큰 저장, 'SIGNUP_REQUIRED'면 signup_token으로 가입 화면. */
export async function login(provider: Provider, providerAccessToken: string): Promise<LoginData> {
  const { data } = await client.post<ApiResponse<LoginData>>(`/api/login/${provider}`, {
    provider_access_token: providerAccessToken,
  });
  return data.data;
}

/** 실패: 닉네임 중복 409, 동네 미선택/없는 동네 400, signup_token 만료 401. */
export async function signup(req: SignupRequest): Promise<TokenData> {
  const { data } = await client.post<ApiResponse<TokenData>>('/api/auth/signup', req);
  return data.data;
}

/** access token이 만료됐으면 실패할 수 있으니, 호출부는 결과와 무관하게 로컬 토큰을 비워야 한다. */
export async function logout(): Promise<void> {
  await client.post<ApiResponse<null>>('/api/auth/logout');
}
