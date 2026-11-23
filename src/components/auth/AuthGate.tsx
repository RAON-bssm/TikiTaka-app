import { useQueryClient } from '@tanstack/react-query';
import { router, usePathname, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';

import { setAnalyticsUserId } from '@/api/analytics';
import { clearSavedCharacter } from '@/api/character';
import { clearPendingPostId, setPendingPostId } from '@/api/deepLink';
import { loadAuthStatus } from '@/api/token';
import { clearTutorialStep } from '@/api/tutorial';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';

// 토큰 확인 전까지 스플래시를 유지한다. 없으면 비로그인 사용자에게 홈이 잠깐 보였다가 튕긴다.
// 이미 숨겨진 뒤 호출되면 reject되므로 무시한다.
SplashScreen.preventAutoHideAsync().catch(() => {});

const POST_PATH_PATTERN = /^\/post\/([^/]+)$/;

/** 로그인 가드. 인터셉터가 재발급 실패로 토큰을 비워도 상태를 구독하므로 로그인 화면으로 보낸다. */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const status = useAuthStatus();
  const segments = useSegments();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const prevStatus = useRef(status);

  useEffect(() => {
    loadAuthStatus();
  }, []);

  // 재발급 실패로 인터셉터가 세션을 끝내면 useClearSession을 거치지 않는다.
  // 그때도 다른 계정으로 다시 로그인했을 때 이전 계정의 캐시·캐릭터·튜토리얼·GA 사용자 id가 남지 않게 여기서 비운다.
  useEffect(() => {
    if (prevStatus.current === 'authenticated' && status === 'unauthenticated') {
      queryClient.clear();
      clearSavedCharacter().catch(() => {});
      clearTutorialStep().catch(() => {});
      setAnalyticsUserId(null);
    }
    prevStatus.current = status;
  }, [status, queryClient]);

  useEffect(() => {
    if (status === 'loading') return;

    const isAuthScreen = segments[0] === '(auth)';

    if (status === 'unauthenticated' && !isAuthScreen) {
      // 공유 링크로 연 게시글이면 로그인 뒤 돌아오도록 기억한다. 로그아웃이 확정된 이 시점에만 저장해야
      // 저장된 토큰이 만료된 사용자도 목적지를 잃지 않는다.
      const postId = POST_PATH_PATTERN.exec(pathname)?.[1];
      if (postId) setPendingPostId(postId);
      router.replace('/(auth)/login');
      // 스플래시는 화면이 실제로 바뀌어 이 effect가 다시 돌 때 내린다. 지금 내리면 홈이 스쳐 보인다.
      return;
    }

    // 로그인된 채로 앱 화면에 왔으면 공유 링크 목적지에 이미 도착했거나 쓸 일이 없다. 남겨 두면 다음 로그인 때 엉뚱하게 이동한다.
    if (status === 'authenticated' && !isAuthScreen) clearPendingPostId();

    SplashScreen.hideAsync().catch(() => {});
  }, [status, segments, pathname]);

  return children;
}
