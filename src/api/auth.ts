import type { ApiResponse } from '@/types/api';
import type { LoginData, Provider, SignupRequest, TokenData } from '@/types/auth';
import client from './client';

export { reissue } from './refresh';

/**
 * 소셜 로그인. 카카오/구글에서 발급받은 access token을 서버로 넘긴다.
 *
 * 응답의 `status`로 분기해야 한다.
 * - 'LOGIN'           → access_token/refresh_token 저장 후 홈으로
 * - 'SIGNUP_REQUIRED' → signup_token을 들고 회원가입 화면으로 (토큰 필드는 내려오지 않는다)
 */
export async function login(provider: Provider, providerAccessToken: string): Promise<LoginData> {
  const { data } = await client.post<ApiResponse<LoginData>>(`/api/login/${provider}`, {
    provider_access_token: providerAccessToken,
  });
  return data.data;
}

/**
 * 회원가입. 로그인에서 받은 signup_token으로 닉네임·동네를 등록하고 토큰을 발급받는다.
 *
 * 실패 응답: 닉네임 중복 409, 동네 미선택/없는 동네 400, signup_token 만료 401.
 */
export async function signup(req: SignupRequest): Promise<TokenData> {
  const { data } = await client.post<ApiResponse<TokenData>>('/api/auth/signup', req);
  return data.data;
}

/**
 * 로그아웃. 서버에 저장된 refresh 토큰을 삭제한다.
 *
 * access token이 이미 만료됐다면 이 요청 자체가 실패할 수 있으므로,
 * 호출부는 성공 여부와 무관하게 로컬 토큰을 비워야 한다. (useLogout 참고)
 */
export async function logout(): Promise<void> {
  await client.post<ApiResponse<null>>('/api/auth/logout');
}
