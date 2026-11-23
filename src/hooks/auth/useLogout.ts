import { useMutation } from '@tanstack/react-query';

import { logout } from '@/api/auth';
import { unregisterPushToken } from '@/api/pushNotification';
import { useClearSession } from './useClearSession';

/**
 * 서버 호출이 실패해도(access token 만료 등) 로컬 정리는 항상 한다(onSettled).
 * 푸시 토큰 해제는 access token이 살아 있는 로그아웃 API 전에 보낸다. 실패해도 로그아웃은 그대로 진행한다.
 */
export function useLogout() {
  const clearSession = useClearSession();

  return useMutation({
    mutationFn: async () => {
      await unregisterPushToken().catch(() => {});
      await logout();
    },
    onSettled: clearSession,
  });
}
