import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

/**
 * 개발용 임시 액세스 토큰(선택).
 *
 * 소셜 로그인 SDK가 아직 연결되지 않아 실제 토큰을 받을 수 없을 때를 위한 폴백이다.
 * `.env`에 EXPO_PUBLIC_DEV_TOKEN을 넣어두면 저장된 토큰이 없을 때만 이 값을 대신 사용하고,
 * 로그인 가드도 이 값을 로그인된 것으로 취급해 개발 중 앱에 진입할 수 있게 한다.
 * 소셜 로그인이 붙으면 이 상수와 관련 폴백을 모두 제거한다.
 */
export const DEV_TOKEN = process.env.EXPO_PUBLIC_DEV_TOKEN;

export const getAccessToken = () => SecureStore.getItemAsync(ACCESS_KEY);
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_KEY);

/**
 * 로그인 상태.
 * - 'loading': 앱 시작 직후, 저장된 토큰을 아직 읽지 못한 상태
 * - 'authenticated' / 'unauthenticated': 판정 완료
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * 로그인 상태 저장소 (React 밖에서도 갱신할 수 있는 아주 작은 외부 스토어).
 *
 * SecureStore 읽기는 비동기라 렌더 중에 바로 알 수 없고, 토큰이 바뀌는 지점이
 * 화면(로그인/로그아웃)뿐 아니라 axios 인터셉터(재발급 실패)에도 있다.
 * 그래서 상태를 여기에 모아두고, 구독자(AuthGate)가 변화를 감지하게 한다.
 */
let authStatus: AuthStatus = 'loading';
const listeners = new Set<() => void>();

/** useSyncExternalStore용 스냅샷. 매번 같은 참조를 돌려줘야 하므로 원시값(문자열)을 쓴다. */
export const getAuthStatus = () => authStatus;

export function subscribeAuthStatus(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setAuthStatus(next: AuthStatus) {
  if (authStatus === next) return;
  authStatus = next;
  listeners.forEach((listener) => listener());
}

/**
 * 앱 시작 시 1회 호출. 저장된 refresh token 유무로 로그인 상태를 정한다.
 *
 * access token이 아니라 refresh token을 보는 이유: access는 30분이면 만료돼 앱을 다시 켰을 때
 * 이미 죽어 있는 경우가 많다. refresh(14일)만 살아 있으면 인터셉터가 알아서 재발급하므로
 * 로그인 상태로 봐도 된다.
 */
export async function loadAuthStatus() {
  const refreshToken = await getRefreshToken();
  setAuthStatus(refreshToken ? 'authenticated' : 'unauthenticated');
}

export async function setTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
  setAuthStatus('authenticated');
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
  setAuthStatus('unauthenticated');
}

/**
 * 회원가입 토큰 (메모리 보관).
 *
 * 가입 이력이 없는 소셜 계정으로 로그인하면 access/refresh 대신 signup_token이 오고,
 * 이 값을 회원가입 요청에 그대로 넘겨야 서버가 어떤 소셜 계정인지 식별한다.
 *
 * SecureStore가 아니라 메모리에 두는 이유:
 * - 만료가 10분이라 앱을 껐다 켠 뒤에 재사용할 일이 없다.
 * - 라우터 파라미터로 넘기면 URL/딥링크에 토큰이 노출된다.
 * 앱을 재시작하면 값이 사라지므로, 그때는 로그인부터 다시 해야 한다.
 */
let signupToken: string | null = null;

export const getSignupToken = () => signupToken;

export function setSignupToken(token: string) {
  signupToken = token;
}

export function clearSignupToken() {
  signupToken = null;
}
