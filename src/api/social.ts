import { login as kakaoLogin, logout as kakaoLogout } from '@react-native-seoul/kakao-login';
import * as AppleAuthentication from 'expo-apple-authentication';

import type { Provider } from '@/types/auth';

/**
 * 취소도 다른 실패와 같은 reject로 오고 code도 항상 'RNKakaoLogins'라, message 문자열로만 구분된다.
 * (iOS 'ClientFailed(Cancelled)', 웹 계정 'AuthFailed(AccessDenied)', Android는 SDK 메시지 그대로)
 * 오탐·미탐 모두 로그인 상태는 망가뜨리지 않는다(에러 토스트 한 번 또는 조용히 머묾).
 */
const CANCEL_MESSAGE_PATTERN = /cancel|access_?denied/i;

const isUserCancelled = (error: unknown) =>
  error instanceof Error && CANCEL_MESSAGE_PATTERN.test(error.message);

/**
 * 서버에 그대로 넘길 소셜 access token을 받아온다.
 * 반환: string = 토큰, null = 사용자가 취소(호출부는 아무것도 안 함), throw = 그 외 실패.
 * 앱에 들어가는 네이티브 앱 키는 URL 스킴에도 노출되는 공개값이고, client secret은 번들에 없다.
 */
export async function getProviderAccessToken(provider: Provider): Promise<string | null> {
  if (provider === 'APPLE') {
    return getAppleIdentityToken();
  }
  if (provider !== 'KAKAO') {
    // 서버 enum에는 GOOGLE도 있지만 앱에는 아직 구글 SDK를 붙이지 않았다.
    throw new Error(`${provider} 로그인은 아직 연결되지 않았습니다.`);
  }

  try {
    const token = await kakaoLogin();
    return token.accessToken;
  } catch (error) {
    if (isUserCancelled(error)) {
      return null;
    }
    throw error;
  }
}

/**
 * scope를 요청하지 않는다. 서버는 토큰의 sub만 식별자로 쓰고, 이메일은 "이메일 숨기기" 때문에 쓰지 않는다.
 */
async function getAppleIdentityToken(): Promise<string | null> {
  const credential = await signInWithApple();
  if (!credential) return null;
  if (!credential.identityToken) {
    throw new Error('Apple 로그인 응답에 identityToken이 없습니다.');
  }
  return credential.identityToken;
}

/**
 * 탈퇴 시 서버가 Apple 토큰을 revoke하려면 authorization code가 필요하다(Apple 가이드라인상 필수).
 * 코드는 5분 안에 한 번만 쓸 수 있어 로그인 때 받아둔 것을 재사용하지 못하고, 탈퇴 직전에 다시 받는다.
 * 반환: string = 코드, null = 사용자가 취소, throw = 그 외 실패.
 */
export async function getAppleAuthorizationCode(): Promise<string | null> {
  const credential = await signInWithApple();
  if (!credential) return null;
  if (!credential.authorizationCode) {
    throw new Error('Apple 로그인 응답에 authorizationCode가 없습니다.');
  }
  return credential.authorizationCode;
}

/** 취소는 code 'ERR_REQUEST_CANCELED'로 구분되어 null로 돌려준다. */
async function signInWithApple(): Promise<AppleAuthentication.AppleAuthenticationCredential | null> {
  try {
    return await AppleAuthentication.signInAsync();
  } catch (error) {
    if (isCodedError(error) && error.code === 'ERR_REQUEST_CANCELED') {
      return null;
    }
    throw error;
  }
}

const isCodedError = (error: unknown): error is { code: string } =>
  typeof error === 'object' && error !== null && 'code' in error;

/**
 * 로그아웃 시 함께 호출한다. 안 하면 다음 로그인이 계정 선택 없이 직전 계정으로 들어간다.
 * 실패는 무시한다 — 로그아웃 자체가 막히는 쪽이 더 나쁘다.
 * Apple은 SDK에 로그아웃이 없고, 매번 시스템 시트로 다시 확인받기 때문에 지울 세션도 없다.
 */
export async function clearProviderSession(): Promise<void> {
  try {
    await kakaoLogout();
  } catch {
    // 로그인한 적 없거나 이미 만료돼도 reject된다.
  }
}
