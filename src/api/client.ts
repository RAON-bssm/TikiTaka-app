import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { reissue } from './refresh';
import { clearSignupToken, clearTokens, getAccessToken, getRefreshToken, setTokens } from './token';

// 기본 Axios 클라이언트 인스턴스 생성
// axios 타입 선언상 `create`가 named export로도 잡혀서 발생하는 false positive이므로 비활성화합니다.
// eslint-disable-next-line import/no-named-as-default-member
const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 토큰이 없어도 되는(=인증 실패해도 재발급 대상이 아닌) 공개 엔드포인트.
 * 이 경로들의 401은 토큰 문제가 아니라 소셜 로그인 실패·가입 토큰 만료 같은 진짜 실패다.
 */
const PUBLIC_PATHS = ['/api/login/', '/api/auth/signup', '/api/auth/refresh'];

const isPublicPath = (url?: string) => !!url && PUBLIC_PATHS.some((path) => url.startsWith(path));

/**
 * 진행 중인 재발급 Promise. 재발급을 한 번으로 묶는(single-flight) 장치다.
 *
 * 서버가 유저당 refresh 토큰을 1개만 들고 있고 재발급 때마다 갈아치우므로,
 * 401이 동시에 여러 개 터졌다고 재발급을 병렬로 쏘면 먼저 성공한 요청이 토큰을 교체해
 * 나머지가 전부 401로 실패한다(=불필요한 강제 로그아웃). 그래서 첫 요청만 실제로
 * 재발급하고, 나머지는 같은 Promise를 함께 기다린다.
 */
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error('저장된 refresh token이 없습니다.');
      }

      const data = await reissue(refreshToken);
      // 서버가 refresh 토큰도 새로 발급(로테이션)하므로 둘 다 저장해야 다음 재발급이 성공한다.
      await setTokens(data.access_token, data.refresh_token);
      return data.access_token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// 요청 인터셉터: 저장된 액세스 토큰을 모든 요청에 자동으로 주입한다.
client.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터: 인증 실패 시 토큰을 재발급해 원래 요청을 한 번 재시도한다.
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // 403도 함께 잡는 이유: 서버의 JWT 필터는 토큰이 유효하지 않아도 예외를 던지지 않고
    // 익명 상태로 통과시킨다. 그래서 만료된 토큰으로 호출하면 401이 아니라
    // 스프링 시큐리티 기본 응답인 403이 오는 경우가 있다.
    const shouldRefresh =
      (status === 401 || status === 403) &&
      !!originalRequest &&
      !originalRequest._retry &&
      !isPublicPath(originalRequest.url);

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    // 재시도한 요청이 또 401이면 무한 재시도로 이어지므로 한 번만 시도한다.
    originalRequest._retry = true;

    let accessToken: string;
    try {
      accessToken = await refreshAccessToken();
    } catch (refreshError) {
      // 재발급까지 실패 = 세션이 끝난 것. 토큰을 비우면 로그인 상태가 'unauthenticated'로 바뀌고,
      // 이를 구독하는 AuthGate가 로그인 화면으로 돌려보낸다. (화면 전환 책임은 AuthGate 한 곳에 둔다)
      await clearTokens();
      clearSignupToken();
      return Promise.reject(refreshError);
    }
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return client(originalRequest);
  },
);

export default client;
