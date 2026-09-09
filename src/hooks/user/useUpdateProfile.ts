import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rankingKeys, userKeys } from '@/api/queryKeys';
import { updateProfile } from '@/api/user';
import type { UpdateProfileRequest } from '@/types/user';

/**
 * 프로필 수정 훅. 부분 수정이라 바꿀 필드만 넘긴다.
 *
 * 메인 동네를 함께 바꿀 수 있고 그러면 점수 소속 동네가 달라지므로, user와 함께
 * ranking 키도 무효화한다. 그러지 않으면 랭킹 화면이 이전 동네 기준으로 남는다.
 *
 * 실패 문구는 화면에서 띄운다. 여기에 넣으면 호출부의 onError와 겹쳐 두 번 뜬다.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: UpdateProfileRequest) => updateProfile(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: rankingKeys.all });
    },
  });
}
