import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { logout } from '@/api/auth';
import { clearSignupToken, clearTokens } from '@/api/token';

/**
 * 로그아웃 훅.
 *
 * 서버 호출이 실패해도(예: access token이 이미 만료) 로컬 토큰은 항상 비운다.
 * 사용자 입장에서 "로그아웃 버튼을 눌렀는데 로그인 상태로 남아 있는" 상황을 막기 위함이다.
 * 다른 계정으로 다시 로그인했을 때 이전 유저 데이터가 보이지 않도록 쿼리 캐시도 비운다.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: async () => {
      await clearTokens();
      clearSignupToken();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });
}
