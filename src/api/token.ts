import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const getAccessToken = () => SecureStore.getItemAsync(ACCESS_KEY);
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_KEY);

export async function setTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
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
