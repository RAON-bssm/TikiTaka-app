import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const getAccessToken = () => SecureStore.getItemAsync(ACCESS_KEY);
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_KEY);

/** 'loading'은 앱 시작 직후 저장된 토큰을 아직 읽지 못한 상태. */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// React 밖(axios 인터셉터의 재발급 실패 등)에서도 갱신되는 외부 스토어. AuthGate가 구독한다.
let authStatus: AuthStatus = 'loading';
const listeners = new Set<() => void>();

/** useSyncExternalStore 스냅샷. 참조가 안정적이도록 원시값을 반환한다. */
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
 * 앱 시작 시 1회 호출. access(30분)는 재시작 시 이미 만료된 경우가 많아,
 * refresh(14일) 유무로 판정한다 — 살아 있으면 인터셉터가 재발급한다.
 */
export async function loadAuthStatus() {
  try {
    const refreshToken = await getRefreshToken();
    setAuthStatus(refreshToken ? 'authenticated' : 'unauthenticated');
  } catch {
    setAuthStatus('unauthenticated');
  }
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
 * 회원가입 토큰은 메모리에만 둔다. 만료가 10분이라 재시작 후 쓸 일이 없고,
 * 라우터 파라미터로 넘기면 URL/딥링크에 노출된다.
 */
let signupToken: string | null = null;

export const getSignupToken = () => signupToken;

export function setSignupToken(token: string) {
  signupToken = token;
}

export function clearSignupToken() {
  signupToken = null;
}
