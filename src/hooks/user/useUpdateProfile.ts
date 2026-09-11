import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rankingKeys, userKeys } from '@/api/queryKeys';
import { updateProfile } from '@/api/user';
import type { UpdateProfileRequest } from '@/types/user';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: UpdateProfileRequest) => updateProfile(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      // 메인 동네를 함께 바꿀 수 있고, 그러면 점수 소속 동네가 달라진다.
      queryClient.invalidateQueries({ queryKey: rankingKeys.all });
    },
  });
}
