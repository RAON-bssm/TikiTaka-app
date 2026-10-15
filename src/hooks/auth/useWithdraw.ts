import { useMutation } from '@tanstack/react-query';

import { withdraw } from '@/api/auth';
import { getAppleAuthorizationCode } from '@/api/social';
import { getLoginProvider } from '@/api/token';
import { useToast } from '@/components/ui/Toast';
import { useClearSession } from './useClearSession';

/**
 * Apple 계정이면 시스템 시트로 한 번 더 인증받아 authorization code를 함께 보낸다(서버가 Apple 토큰 revoke).
 * 시트에서 취소하면 요청을 보내지 않고 false로 끝낸다 — 에러가 아니라 조용히 팝업에 머문다.
 */
async function withdrawWithReauth(): Promise<boolean> {
  const provider = await getLoginProvider();
  if (provider !== 'APPLE') {
    await withdraw();
    return true;
  }

  const authorizationCode = await getAppleAuthorizationCode();
  if (!authorizationCode) return false;
  await withdraw({ authorization_code: authorizationCode });
  return true;
}

/**
 * 로그아웃과 달리 성공했을 때만 로컬을 정리한다. 실패하면 계정이 살아 있으니 화면에 남겨 다시 시도하게 한다.
 * 성공 토스트를 여기서 띄우는 이유: 로그인 화면으로 바뀌면 호출한 팝업이 사라져 mutate의 onSuccess가 불리지 않는다.
 */
export function useWithdraw() {
  const clearSession = useClearSession();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: withdrawWithReauth,
    onSuccess: async (withdrawn) => {
      if (!withdrawn) return;
      showToast('탈퇴했어요. 그동안 고마웠어요');
      await clearSession();
    },
  });
}
