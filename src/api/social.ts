import type { Provider } from '@/types/auth';

/**
 * 소셜 SDK 연동 자리 (**아직 미구현**).
 *
 * 서버는 인가 코드가 아니라 소셜에서 발급받은 **access token**을 받으므로,
 * 이 함수가 카카오/구글 로그인 창을 띄우고 access token 문자열을 돌려주면 된다.
 *
 * 구현할 때 필요한 것:
 * - `pnpm expo install expo-auth-session expo-crypto`
 * - 카카오: 네이티브 앱 키 / REST API 키 + 리다이렉트 URI 등록 (`tikitaka://` 스킴은 app.json에 이미 있음)
 * - 구글: iOS/Android OAuth 클라이언트 ID
 * - 발급받은 키는 `.env`에 EXPO_PUBLIC_ 접두사로 넣고 `.env.example`에도 이름을 남길 것
 *
 * 연동 전까지는 null을 돌려주고, 호출부(useSocialLogin)가 이를 "준비 중"으로 처리한다.
 */
export async function getProviderAccessToken(provider: Provider): Promise<string | null> {
  console.warn(`[auth] ${provider} 로그인 SDK가 아직 연결되지 않았습니다.`);
  return null;
}
