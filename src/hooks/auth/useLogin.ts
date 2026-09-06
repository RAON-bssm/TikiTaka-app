import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { login } from '@/api/auth';
import { setSignupToken, setTokens } from '@/api/token';
import type { LoginData, Provider } from '@/types/auth';

/**
 * 소셜 로그인 훅.
 *
 * 서버 응답의 `status`에 따라 두 갈래로 갈린다.
 * - 'LOGIN'           → 토큰을 SecureStore에 저장하고 홈으로. 이후 요청은 client.ts 인터셉터가 토큰을 자동으로 붙인다.
 * - 'SIGNUP_REQUIRED' → 아직 가입 전. signup_token을 메모리에 두고 회원 정보 등록 화면으로 보낸다.
 *
 * 사용: const { mutate: login } = useLogin();
 *       login({ provider: 'KAKAO', providerAccessToken });
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
