export type Provider = 'google' | 'kakao';

/** POST /api/login/{provider} 요청 body */
export interface LoginRequest {
  authorization_code: string;
}

/** 로그인 응답 data — 토큰 묶음 */
export interface LoginData {
  grantType: string;
  accessToken: string;
  refreshToken: string;
}
