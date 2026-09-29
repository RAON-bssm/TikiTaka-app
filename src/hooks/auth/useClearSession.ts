import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { clearSavedCharacter } from '@/api/character';
import { clearProviderSession } from '@/api/social';
import { clearSignupToken, clearTokens } from '@/api/token';

/**
 * 로그아웃·탈퇴 뒤 기기에 남은 계정 흔적을 지우고 로그인 화면으로 보낸다.
 * - 쿼리 캐시: 다른 계정으로 재로그인 시 이전 유저 데이터가 보이지 않게 비운다.
 * - 캐릭터 config: 기기 단위 저장이라 다음 계정에 이전 캐릭터가 보이지 않게 지운다.
 * - 카카오 SDK 세션: 남겨두면 재로그인 때 계정 선택 없이 직전 계정으로 들어가 전환이 불가능하다.
 */
export function useClearSession() {
  const queryClient = useQueryClient();

  return async () => {
    await clearProviderSession();
    await clearTokens();
    try {
      await clearSavedCharacter();
    } finally {
      clearSignupToken();
      queryClient.clear();
      router.replace('/(auth)/login');
    }
  };
}
