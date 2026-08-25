import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { signup } from '@/api/auth';
import { clearSignupToken, getSignupToken, setTokens } from '@/api/token';

/**
 * 회원가입 훅.
 *
 * 로그인 단계에서 받아 메모리에 둔 signup_token을 함께 보낸다.
 * 이 토큰은 만료가 10분이라 동네를 고르다 시간이 지나면 만료될 수 있고,
 * 앱을 재시작해도 사라진다. 두 경우 모두 로그인부터 다시 해야 한다.
 *
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
      // 가입이 끝나면 1회용 토큰은 더 쓸 일이 없다.
      clearSignupToken();
      router.replace('/(tabs)');
    },
  });
}
