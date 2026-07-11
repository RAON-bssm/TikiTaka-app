import { useMutation } from '@tanstack/react-query';

import { login } from '@/api/auth';
import { setTokens } from '@/api/token';
import type { Provider } from '@/types/auth';

/**
 * 소셜 로그인 훅.
 *
 * 로그인 성공 시 받은 토큰을 SecureStore에 저장한다.
 * 저장만 해두면 이후 모든 요청은 client.ts 인터셉터가 토큰을 자동으로 붙인다.
 *
 * 사용: const { mutate: login } = useLogin();
 *       login({ provider: 'kakao', authorizationCode });
 */
export function useLogin() {
  return useMutation({
    mutationFn: ({
      provider,
      authorizationCode,
    }: {
      provider: Provider;
      authorizationCode: string;
    }) => login(provider, authorizationCode),
    onSuccess: (data) => setTokens(data.accessToken, data.refreshToken),
  });
}
