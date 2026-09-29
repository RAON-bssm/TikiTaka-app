import { useMutation } from '@tanstack/react-query';

import { logout } from '@/api/auth';
import { useClearSession } from './useClearSession';

/** 서버 호출이 실패해도(access token 만료 등) 로컬 정리는 항상 한다(onSettled). */
export function useLogout() {
  const clearSession = useClearSession();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: clearSession,
  });
}
