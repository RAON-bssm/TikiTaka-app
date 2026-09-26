import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { reissue } from './refresh';
import { clearSignupToken, clearTokens, getAccessToken, getRefreshToken, setTokens } from './token';

// axios 타입 선언상 `create`가 named export로도 잡히는 false positive라 비활성화한다.
// eslint-disable-next-line import/no-named-as-default-member
const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 재발급 대상이 아닌 공개 엔드포인트. 여기서의 401은 토큰 문제가 아니라 진짜 실패다.
 * `/api/location`·`/api/auth/check-name`은 가입 화면이 토큰 발급 전에 부르므로, 재발급 흐름에 들어가면 signup token이 지워져 가입이 막힌다.
 */
const PUBLIC_PATHS = [
  '/api/login/',
  '/api/auth/signup',
  '/api/auth/check-name',
  '/api/auth/refresh',
  '/api/location',
];

const isPublicPath = (url?: string) => !!url && PUBLIC_PATHS.some((path) => url.startsWith(path));

/**
 * 재발급 single-flight. 서버가 유저당 refresh 토큰 1개를 로테이션하므로, 동시 401에 재발급을
 * 병렬로 쏘면 먼저 성공한 쪽이 토큰을 바꿔 나머지가 실패(강제 로그아웃)한다.
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
      await setTokens(data.access_token, data.refresh_token);
      return data.access_token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

client.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 인증 실패 시 토큰을 재발급해 원래 요청을 한 번 재시도한다.
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // 서버 JWT 필터는 무효 토큰을 익명으로 통과시켜, 만료 토큰에 401 대신 403이 오기도 한다.
    const shouldRefresh =
      (status === 401 || status === 403) &&
      !!originalRequest &&
      !originalRequest._retry &&
      !isPublicPath(originalRequest.url);

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    let accessToken: string;
    try {
      accessToken = await refreshAccessToken();
    } catch (refreshError) {
      // 세션 종료. 토큰을 비우면 AuthGate가 로그인 화면으로 보낸다(화면 전환 책임은 AuthGate에만).
      await clearTokens();
      clearSignupToken();
      return Promise.reject(refreshError);
    }
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return client(originalRequest);
  },
);

export default client;
