import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { login } from '@/api/auth';
import { setSignupToken, setTokens } from '@/api/token';
import type { LoginData, Provider } from '@/types/auth';

/**
 * 'LOGIN'이면 토큰 저장 후 홈으로, 'SIGNUP_REQUIRED'면 signup_token을 메모리에 두고 가입 화면으로 보낸다.
 */
export function useLogin() {
  return useMutation({
    mutationFn: ({
      provider,
      providerAccessToken,
    }: {
      provider: Provider;
      providerAccessToken: string;
    }) => login(provider, providerAccessToken),
    onSuccess: async (data: LoginData) => {
      if (data.status === 'SIGNUP_REQUIRED') {
        if (!data.signup_token) {
          throw new Error('회원가입 토큰이 응답에 없습니다.');
        }
        setSignupToken(data.signup_token);
        router.push('/(auth)/signup');
        return;
      }

      if (!data.access_token || !data.refresh_token) {
        throw new Error('로그인 응답에 토큰이 없습니다.');
      }
      await setTokens(data.access_token, data.refresh_token);
      router.replace('/(tabs)');
    },
  });
}
