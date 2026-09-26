import { login as kakaoLogin, logout as kakaoLogout } from '@react-native-seoul/kakao-login';

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
 * 로그아웃 시 함께 호출한다. 안 하면 다음 로그인이 계정 선택 없이 직전 계정으로 들어간다.
 * 실패는 무시한다 — 로그아웃 자체가 막히는 쪽이 더 나쁘다.
 */
export async function clearProviderSession(): Promise<void> {
  try {
    await kakaoLogout();
  } catch {
    // 로그인한 적 없거나 이미 만료돼도 reject된다.
  }
}
