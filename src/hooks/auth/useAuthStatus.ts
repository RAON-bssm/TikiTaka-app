import { useSyncExternalStore } from 'react';

import { getAuthStatus, subscribeAuthStatus, type AuthStatus } from '@/api/token';

/**
 * 현재 로그인 상태를 구독한다.
 *
 * 토큰은 화면(로그인/로그아웃)뿐 아니라 axios 인터셉터(재발급 실패)에서도 바뀌므로,
 * React 상태가 아니라 token.ts의 외부 스토어를 구독해 어느 경로로 바뀌든 함께 갱신되게 한다.
 */
export function useAuthStatus(): AuthStatus {
  return useSyncExternalStore(subscribeAuthStatus, getAuthStatus, getAuthStatus);
}
