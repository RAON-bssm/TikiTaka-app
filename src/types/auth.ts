import type { EmptyResponse } from './api';

/**
 * 로그인 제공자.
 *
 * 서버가 `@PathVariable LoginProvider provider`로 enum 변환을 하므로,
 * 값이 서버 enum(KAKAO/GOOGLE)과 **대소문자까지** 정확히 같아야 한다.
 * 소문자로 보내면 enum 변환에 실패해 400이 난다.
 */
export type Provider = 'KAKAO' | 'GOOGLE';

/**
 * POST /api/login/{provider} 요청 body.
 *
 * 서버는 인가 코드(authorization code)가 아니라 **소셜에서 이미 발급받은 access token**을 받는다.
 * 이 토큰으로 카카오 `/v2/user/me`, 구글 userinfo를 직접 호출해 사용자 식별자를 얻는다.
 */
export interface LoginRequest {
  provider_access_token: string;
}

/** 로그인 결과 분기값. 가입 이력이 없으면 SIGNUP_REQUIRED가 온다. */
export type LoginStatus = 'LOGIN' | 'SIGNUP_REQUIRED';

/**
 * 로그인 응답 data.
 *
 * 서버가 `default-property-inclusion: non_null`이라 해당 없는 필드는 null이 아니라
 * **키 자체가 내려오지 않는다.** 그래서 토큰 필드는 모두 옵셔널이다.
 * - status === 'LOGIN'            → access_token, refresh_token
 * - status === 'SIGNUP_REQUIRED'  → signup_token
 */
export interface LoginData {
  status: LoginStatus;
  access_token?: string;
  refresh_token?: string;
  signup_token?: string;
}

/** POST /api/auth/signup 요청 body. */
export interface SignupRequest {
  signup_token: string;
  user_name: string;
  main_location_id: number;
}

/** POST /api/auth/refresh 요청 body. */
export interface ReissueRequest {
  refresh_token: string;
}

/**
 * 회원가입·재발급 응답 data.
 *
 * 재발급은 **로테이션 방식**이라 access_token뿐 아니라 refresh_token도 새 값이 온다.
 * 서버는 유저당 refresh 토큰을 1개만 보관하므로, 새 refresh_token을 저장하지 않으면
 * 다음 재발급이 401로 실패한다.
 */
export interface TokenData {
  access_token: string;
  refresh_token: string;
}

/**
 * 로그아웃 응답. `POST /api/auth/logout` (body 없음)
 *
 * 서버는 refresh 토큰만 지운다. 이미 발급된 access token은 만료까지 유효하므로
 * 호출부가 로컬 토큰도 비워야 실제로 로그아웃된다.
 */
export type LogoutResponse = EmptyResponse;
