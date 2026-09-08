import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

/**
 * 앱 전역 QueryClient. 기본 옵션을 한곳에 모아둔다.
 *
 * 기본값을 명시하지 않으면 조회는 3회 재시도(지수 백오프), 캐시는 즉시 stale이 된다.
 * 이 앱에서는 두 값 모두 맞지 않아 아래처럼 바꿨다.
 *
 * 개별 훅에서 필요하면 옵션을 덮어쓴다. (예: `useViewUrl`은 presigned URL 만료에 맞춰
 * `staleTime` 9분, `useCharacterConfig`는 로컬 저장소가 유일한 출처라 `Infinity`)
 *
 * 참고: `refetchOnWindowFocus`는 React Native에서 `AppState`를 `focusManager`에 연결해야
 * 동작한다. 아직 연결하지 않았으므로 지금은 설정해도 무의미해 넣지 않았다.
 */

/**
 * 조회 결과를 재요청 없이 신선하다고 볼 시간.
 *
 * 0(기본값)이면 화면을 다시 들어갈 때마다 요청이 나간다. 랭킹·게시물 목록은 라운드
 * 단위로 바뀌는 데이터라 탭을 옮길 때마다 다시 받을 이유가 없다.
 */
const DEFAULT_STALE_TIME = 60 * 1000;

/** 조회 재시도 횟수(첫 요청 제외). 모바일 네트워크가 순간적으로 끊기는 경우만 구제한다. */
const QUERY_RETRY_COUNT = 1;

/**
 * 재시도할 가치가 있는 실패인지 판단한다. **응답이 없는 경우(네트워크)와 5xx만** 재시도한다.
 *
 * 4xx는 다시 보내도 결과가 같다. 특히 401/403은 `client.ts`의 인터셉터가 **이미**
 * 토큰 재발급 후 재시도를 한 뒤의 실패이므로, 여기서 또 시도하면 끝난 세션으로
 * 같은 요청을 더 쏘고 그만큼 로그인 화면 복귀가 늦어진다.
 *
 * 재발급 자체가 실패하면 인터셉터는 원래의 401이 아니라 **재발급 에러를 던진다.**
 * 그 값은 `AxiosError`가 아닐 수 있어서(예: 저장된 refresh token이 없는 경우),
 * axios 에러가 아닌 실패는 재시도하지 않는 쪽으로 둔다.
 */
function retryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount > QUERY_RETRY_COUNT) {
    return false;
  }
  if (isAxiosError(error)) {
    // response가 없으면 타임아웃·연결 실패 등으로 서버에 닿지도 못한 것이다.
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
      // 부수효과가 있는 요청은 자동 재시도하면 중복 실행된다. (게시물이 두 번 올라가거나
      // 포인트가 두 번 차감된다) 실패하면 사용자가 다시 누르게 한다.
      retry: 0,
    },
  },
});
