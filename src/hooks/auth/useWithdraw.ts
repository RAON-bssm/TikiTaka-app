import { useMutation } from '@tanstack/react-query';

import { withdraw } from '@/api/auth';
import { registerCurrentPushToken, unregisterPushToken } from '@/api/pushNotification';
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
  const authorizationCode = provider === 'APPLE' ? await getAppleAuthorizationCode() : undefined;
  if (provider === 'APPLE' && !authorizationCode) return false;

  // 푸시 토큰 해제는 access token이 살아 있는 탈퇴 API 전에 보낸다. 실패해도 탈퇴는 그대로 진행한다.
  await unregisterPushToken().catch(() => {});
  await withdraw(authorizationCode ? { authorization_code: authorizationCode } : undefined);
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
    // 탈퇴가 실패하면 계정이 살아 있으니, 먼저 지운 푸시 토큰을 되돌린다.
    onError: () => {
      registerCurrentPushToken().catch(() => {});
    },
    onSuccess: async (withdrawn) => {
      if (!withdrawn) return;
      showToast('탈퇴했어요. 그동안 고마웠어요', { type: 'success' });
      await clearSession();
    },
  });
}
