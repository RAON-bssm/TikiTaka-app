import type { ApiResponse, EmptyResponse } from '@/types/api';
import type { CheckNameData, LoginData, Provider, SignupRequest, TokenData } from '@/types/auth';
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

export async function checkUserName(userName: string): Promise<boolean> {
  const { data } = await client.get<ApiResponse<CheckNameData>>('/api/auth/check-name', {
    params: { user_name: userName },
  });
  return data.data.available;
}

/** access token이 만료됐으면 실패할 수 있으니, 호출부는 결과와 무관하게 로컬 토큰을 비워야 한다. */
export async function logout(): Promise<void> {
  await client.post<ApiResponse<null>>('/api/auth/logout');
}

/**
 * 서버가 닉네임·소셜 식별자를 익명화하고 refresh token을 지운다. 같은 소셜 계정으로 다시 들어오면 새 가입이다.
 * HTTP 204라 바디가 없다. 로그아웃과 달리 실패하면 계정이 그대로 남으므로 로컬 정리도 하지 않는다.
 */
export async function withdraw(): Promise<void> {
  await client.post<EmptyResponse>('/api/auth/withdraw');
}
