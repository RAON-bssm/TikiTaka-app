import { login as kakaoLogin, logout as kakaoLogout } from '@react-native-seoul/kakao-login';

import type { Provider } from '@/types/auth';

/**
 * 사용자가 로그인 창을 직접 닫았는지(취소) 판별한다.
 *
 * 네이티브 SDK는 취소도 다른 실패와 똑같이 reject로 돌려주는데, 취소는 "실패"가 아니라
 * 사용자의 의사표시라 에러 토스트를 띄우면 안 된다. 문제는 취소 여부를 구분할 에러 코드가
 * 없다는 점이다. 네이티브가 던지는 code는 항상 'RNKakaoLogins' 하나이고, 구분은 message
 * 문자열에만 남는데 그 문자열이 플랫폼·경로마다 다르다.
 * - iOS 카카오톡 취소:   'ClientFailed(Cancelled): ...'
 * - 카카오계정 웹 취소:  'AuthFailed(AccessDenied): ...' (동의 화면에서 취소 → access_denied)
 * - Android:            Kakao SDK 예외 메시지가 그대로 오며 cancel/access_denied 표현이 섞인다
 *
 * 그래서 문자열 매칭이 최선이다. 못 잡으면 취소한 사용자에게 에러 토스트가 한 번 뜰 뿐이고,
 * 반대로 오탐하면 조용히 원래 화면에 머문다. 어느 쪽도 로그인 상태를 망가뜨리지 않는다.
 */
const CANCEL_MESSAGE_PATTERN = /cancel|access_?denied/i;

const isUserCancelled = (error: unknown) =>
  error instanceof Error && CANCEL_MESSAGE_PATTERN.test(error.message);

/**
 * 소셜 로그인 창을 띄우고 access token을 받아온다.
 *
 * 서버는 인가 코드가 아니라 소셜에서 발급받은 **access token**을 받으므로
 * (`POST /api/login/{provider}`의 `provider_access_token`), 여기서 얻은 문자열을 그대로 넘기면 된다.
 *
 * 네이티브 SDK를 쓰기 때문에 앱에 들어가는 건 네이티브 앱 키뿐이다. 이 키는 URL 스킴
 * (`kakao{앱키}://oauth`)에도 그대로 노출되는 공개값이라 감출 대상이 아니고, 코드↔토큰 교환은
 * 카카오 SDK가 처리하므로 client secret은 앱 번들에 들어오지 않는다.
 *
 * 반환값
 * - string: 발급받은 access token
 * - null:   사용자가 로그인 창을 닫음(취소). 호출부는 아무 것도 하지 않으면 된다.
 * - throw:  그 외 실패(네트워크, 앱 키 설정 오류 등). 호출부에서 안내가 필요하다.
 */
export async function getProviderAccessToken(provider: Provider): Promise<string | null> {
  if (provider !== 'KAKAO') {
    // 서버 enum에는 GOOGLE도 있지만 앱에는 아직 구글 SDK를 붙이지 않았다.
    throw new Error(`${provider} 로그인은 아직 연결되지 않았습니다.`);
  }

  try {
    // 카카오톡이 깔려 있으면 앱으로, 아니면 카카오계정 웹 로그인으로 SDK가 알아서 분기한다.
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
 * 소셜 세션 정리. 로그아웃할 때 우리 서버 토큰과 함께 비운다.
 *
 * 이걸 하지 않으면 SDK에 카카오 토큰이 남아, 로그아웃 후 다시 로그인할 때 계정 선택 없이
 * 직전 계정으로 그대로 들어가버린다.
 *
 * 실패해도 무시한다. 소셜 세션이 남는 것보다 로그아웃 자체가 막히는 쪽이 더 나쁘고,
 * 우리 서버 토큰은 호출부에서 어차피 비우기 때문이다.
 */
export async function clearProviderSession(): Promise<void> {
  try {
    await kakaoLogout();
  } catch {
    // 로그인한 적이 없거나 이미 만료된 경우에도 reject된다. 정상 흐름이므로 삼킨다.
  }
}
