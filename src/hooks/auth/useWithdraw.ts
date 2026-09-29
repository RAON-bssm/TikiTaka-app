import { useMutation } from '@tanstack/react-query';

import { withdraw } from '@/api/auth';
import { useToast } from '@/components/ui/Toast';
import { useClearSession } from './useClearSession';

/**
 * 로그아웃과 달리 성공했을 때만 로컬을 정리한다. 실패하면 계정이 살아 있으니 화면에 남겨 다시 시도하게 한다.
 * 성공 토스트를 여기서 띄우는 이유: 로그인 화면으로 바뀌면 호출한 팝업이 사라져 mutate의 onSuccess가 불리지 않는다.
 */
export function useWithdraw() {
  const clearSession = useClearSession();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: () => withdraw(),
    onSuccess: async () => {
      showToast('탈퇴했어요. 그동안 고마웠어요');
      await clearSession();
    },
  });
}
