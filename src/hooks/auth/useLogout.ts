import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { logout } from '@/api/auth';
import { clearProviderSession } from '@/api/social';
import { clearSignupToken, clearTokens } from '@/api/token';

/**
 * 서버 호출이 실패해도(access token 만료 등) 로컬 정리는 항상 한다(onSettled).
 * - 쿼리 캐시: 다른 계정으로 재로그인 시 이전 유저 데이터가 보이지 않게 비운다.
 * - 카카오 SDK 세션: 남겨두면 재로그인 때 계정 선택 없이 직전 계정으로 들어가 전환이 불가능하다.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: async () => {
      await clearProviderSession();
      await clearTokens();
      clearSignupToken();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });
}
