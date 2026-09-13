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
      // 랭킹 목록이 닉네임을 함께 내려주므로 이름이 바뀌면 거기도 갱신돼야 한다.
      queryClient.invalidateQueries({ queryKey: rankingKeys.all });
    },
  });
}
