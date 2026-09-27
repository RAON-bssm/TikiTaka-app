import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { logout } from '@/api/auth';
import { clearSavedCharacter } from '@/api/character';
import { clearProviderSession } from '@/api/social';
import { clearSignupToken, clearTokens } from '@/api/token';

/**
 * 서버 호출이 실패해도(access token 만료 등) 로컬 정리는 항상 한다(onSettled).
 * - 쿼리 캐시: 다른 계정으로 재로그인 시 이전 유저 데이터가 보이지 않게 비운다.
 * - 캐릭터 config: 기기 단위 저장이라 다음 계정에 이전 캐릭터가 보이지 않게 지운다.
 * - 카카오 SDK 세션: 남겨두면 재로그인 때 계정 선택 없이 직전 계정으로 들어가 전환이 불가능하다.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: async () => {
      await clearProviderSession();
      await clearTokens();
      await clearSavedCharacter();
      clearSignupToken();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });
}
