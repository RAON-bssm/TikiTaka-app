import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { signup } from '@/api/auth';
import { clearSignupToken, getSignupToken, setTokens } from '@/api/token';

/**
 * signup_token은 메모리에만 있고 만료가 10분이라, 앱 재시작·시간 초과 시 로그인부터 다시 해야 한다.
 * 실패 응답: 닉네임 중복 409, 동네 미선택/없는 동네 400, 토큰 만료 401.
 */
export function useSignup() {
  return useMutation({
    mutationFn: ({ userName, mainLocationId }: { userName: string; mainLocationId: number }) => {
      const signupToken = getSignupToken();
      if (!signupToken) {
        throw new Error('회원가입 토큰이 없습니다. 로그인부터 다시 해주세요.');
      }

      return signup({
        signup_token: signupToken,
        user_name: userName,
        main_location_id: mainLocationId,
      });
    },
    onSuccess: async (data) => {
      await setTokens(data.access_token, data.refresh_token);
      clearSignupToken();
      router.replace('/(tabs)');
    },
  });
}
