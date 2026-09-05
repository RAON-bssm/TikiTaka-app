import { router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { loadAuthStatus } from '@/api/token';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';

// 저장된 토큰을 확인하기 전까지 스플래시를 띄워둔다.
// 이게 없으면 로그인 안 된 사용자에게 홈 화면이 잠깐 보였다가 로그인 화면으로 튕기는 깜빡임이 생긴다.
SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 숨겨진 뒤 호출되면 reject된다. 앱 동작에는 영향이 없으므로 무시한다.
});

/**
 * 로그인 가드.
 *
 * 앱에 처음 들어오면 저장된 토큰을 읽어 로그인 상태를 판정하고,
 * 로그인되지 않았다면 어느 화면으로 진입했든 로그인 화면으로 돌려보낸다.
 *
 * 재발급 실패로 인터셉터가 토큰을 비우는 경우에도 상태 변화를 구독하고 있으므로
 * 사용 중에 세션이 끊기면 마찬가지로 로그인 화면으로 이동한다.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const status = useAuthStatus();
  const segments = useSegments();

  // 앱 시작 시 1회: SecureStore에서 토큰을 읽어 'loading' 상태를 해소한다.
  useEffect(() => {
    loadAuthStatus();
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    // 로그인/회원가입 화면은 로그인하지 않아야 갈 수 있는 곳이므로 가드에서 제외한다.
    const isAuthScreen = segments[0] === '(auth)';

    if (status === 'unauthenticated' && !isAuthScreen) {
      router.replace('/(auth)/login');
      // 아직 스플래시를 내리지 않는다. 화면이 실제로 바뀌면 segments가 변해 이 effect가 다시 돌고,
      // 그때 스플래시를 내려야 홈 화면이 스쳐 보이지 않는다.
      return;
    }

    SplashScreen.hideAsync().catch(() => {});
  }, [status, segments]);

  return children;
}
