import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

/**
 * 앱 전역 QueryClient.
 *
 * `refetchOnWindowFocus`는 React Native에서 `AppState`를 `focusManager`에 연결해야
 * 동작하므로, 연결하기 전에는 설정해도 무의미해 두지 않았다.
 */

/**
 * 조회 캐시 유효시간. 0(기본값)이면 화면에 다시 들어갈 때마다 요청이 나간다.
 * 개별 훅에서 덮어쓴다. (`useViewUrl` 9분, `useCharacterConfig` Infinity)
 */
const DEFAULT_STALE_TIME = 60 * 1000;

/** 조회 재시도 횟수(첫 요청 제외). */
const QUERY_RETRY_COUNT = 1;

/**
 * 응답이 없는 경우(네트워크)와 5xx만 재시도한다.
 *
 * 401/403은 `client.ts` 인터셉터가 **이미** 토큰 재발급 후 재시도를 한 뒤의 실패다.
 * 재발급 자체가 실패하면 인터셉터는 원래의 401이 아니라 재발급 에러를 던지고 그 값은
 * `AxiosError`가 아닐 수 있어, axios 에러가 아닌 실패도 재시도하지 않는다.
 */
function retryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount > QUERY_RETRY_COUNT) {
    return false;
  }
  if (isAxiosError(error)) {
    const status = error.response?.status;
    return status === undefined || status >= 500;
  }
  return false;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: retryQuery,
      staleTime: DEFAULT_STALE_TIME,
    },
    mutations: {
      // 자동 재시도하면 게시물이 두 번 올라가거나 포인트가 두 번 차감된다.
      retry: 0,
    },
  },
});
