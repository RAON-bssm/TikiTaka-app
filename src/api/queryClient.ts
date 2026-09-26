import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

// `refetchOnWindowFocus`는 RN에서 AppState를 focusManager에 연결해야 동작하므로 아직 두지 않았다.

/** 개별 훅에서 덮어쓴다. (`useViewUrl` 9분, `useCharacterConfig` Infinity) */
const DEFAULT_STALE_TIME = 60 * 1000;

/** 첫 요청 제외. */
const QUERY_RETRY_COUNT = 1;

/**
 * 네트워크 오류와 5xx만 재시도한다. 401/403은 인터셉터가 이미 재발급·재시도한 뒤의 실패이고,
 * 재발급 실패 에러는 AxiosError가 아닐 수 있어 axios 에러가 아니면 재시도하지 않는다.
 */
function retryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= QUERY_RETRY_COUNT) {
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
