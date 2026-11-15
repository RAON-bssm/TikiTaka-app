import { useEffect } from 'react';

import { setAnalyticsUserId } from '@/api/analytics';
import { useMyInfo } from './useMyInfo';

/**
 * 로그인한 화면(탭)에서 GA 사용자 id를 맞춘다. 로그인 응답에는 user_id가 없어 내 정보에서 받는다.
 * 앱을 다시 열어 로그인 과정 없이 들어온 경우도 여기서 설정된다. 지우는 건 `useClearSession`과 `AuthGate`(재발급 실패로 세션이 끝난 경우).
 */
export function useAnalyticsUserId() {
  const userId = useMyInfo().data?.user_id;

  useEffect(() => {
    if (userId) setAnalyticsUserId(userId);
  }, [userId]);
}
