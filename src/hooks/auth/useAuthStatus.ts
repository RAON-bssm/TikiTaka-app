import { useSyncExternalStore } from 'react';

import { getAuthStatus, subscribeAuthStatus, type AuthStatus } from '@/api/token';

/** 토큰은 axios 인터셉터(재발급 실패)에서도 바뀌므로 React 상태 대신 token.ts의 외부 스토어를 구독한다. */
export function useAuthStatus(): AuthStatus {
  return useSyncExternalStore(subscribeAuthStatus, getAuthStatus, getAuthStatus);
}
