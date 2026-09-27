import type { EmptyResponse } from './api';

/** 서버 enum 변환(`@PathVariable`)이라 대소문자까지 같아야 한다. 소문자면 400. */
export type Provider = 'KAKAO' | 'GOOGLE';

/** 인가 코드가 아니라 소셜에서 이미 발급받은 access token을 보낸다. */
export interface LoginRequest {
  provider_access_token: string;
}

export type LoginStatus = 'LOGIN' | 'SIGNUP_REQUIRED';

/**
 * 서버가 `non_null`이라 해당 없는 필드는 키가 빠진다.
 * LOGIN → access_token·refresh_token, SIGNUP_REQUIRED → signup_token.
 */
export interface LoginData {
  status: LoginStatus;
  access_token?: string;
  refresh_token?: string;
  signup_token?: string;
}

export interface SignupRequest {
  signup_token: string;
  user_name: string;
  main_location_id: number;
}

/**
 * `GET /api/auth/check-name?user_name=` (인증 불필요). 사용 중이어도 200에 `available: false`로 온다.
 * 확인과 가입 사이에 선점될 수 있어, true여도 가입의 409는 따로 처리해야 한다.
 */
export interface CheckNameData {
  available: boolean;
}

export interface ReissueRequest {
  refresh_token: string;
}

/** 재발급은 로테이션 방식이라 새 refresh_token을 저장하지 않으면 다음 재발급이 401. */
export interface TokenData {
  access_token: string;
  refresh_token: string;
}

/** 서버는 refresh 토큰만 지우므로, access token은 호출부가 로컬에서 비워야 한다. */
export type LogoutResponse = EmptyResponse;
