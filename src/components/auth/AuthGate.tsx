import { useQueryClient } from '@tanstack/react-query';
import { router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';

import { clearSavedCharacter } from '@/api/character';
import { loadAuthStatus } from '@/api/token';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';

// 토큰 확인 전까지 스플래시를 유지한다. 없으면 비로그인 사용자에게 홈이 잠깐 보였다가 튕긴다.
// 이미 숨겨진 뒤 호출되면 reject되므로 무시한다.
SplashScreen.preventAutoHideAsync().catch(() => {});

/** 로그인 가드. 인터셉터가 재발급 실패로 토큰을 비워도 상태를 구독하므로 로그인 화면으로 보낸다. */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const status = useAuthStatus();
  const segments = useSegments();
  const queryClient = useQueryClient();
  const prevStatus = useRef(status);

  useEffect(() => {
    loadAuthStatus();
  }, []);

  // 재발급 실패로 인터셉터가 세션을 끝내면 useClearSession을 거치지 않는다.
  // 그때도 다른 계정으로 다시 로그인했을 때 이전 계정의 캐시·캐릭터가 보이지 않게 여기서 비운다.
  useEffect(() => {
    if (prevStatus.current === 'authenticated' && status === 'unauthenticated') {
      queryClient.clear();
      clearSavedCharacter().catch(() => {});
    }
    prevStatus.current = status;
  }, [status, queryClient]);

  useEffect(() => {
    if (status === 'loading') return;

    const isAuthScreen = segments[0] === '(auth)';

    if (status === 'unauthenticated' && !isAuthScreen) {
      router.replace('/(auth)/login');
      // 스플래시는 화면이 실제로 바뀌어 이 effect가 다시 돌 때 내린다. 지금 내리면 홈이 스쳐 보인다.
      return;
    }

    SplashScreen.hideAsync().catch(() => {});
  }, [status, segments]);

  return children;
}
