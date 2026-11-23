import { useEffect } from 'react';

import { subscribePushTokenRegistration } from '@/api/pushNotification';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';

/**
 * 로그인 상태가 되면(앱 실행 시 자동 로그인 확인 후, 로그인·가입 직후) FCM 토큰을 서버에 등록하고 토큰 갱신을 구독한다.
 * 등록하지 않은 기기로는 서버가 알림을 보내지 못한다.
 */
export function usePushTokenRegistration() {
  const status = useAuthStatus();

  useEffect(() => {
    if (status !== 'authenticated') return;
    return subscribePushTokenRegistration();
  }, [status]);
}
