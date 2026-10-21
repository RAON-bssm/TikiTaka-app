import { useMutation, useQueryClient } from '@tanstack/react-query';

import { unblockUser } from '@/api/block';
import { blockKeys, postKeys, rankingKeys } from '@/api/queryKeys';

/** 해제하면 그 유저 콘텐츠가 다시 보여야 하므로 차단과 같은 키들을 무효화한다. */
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: rankingKeys.all });
    },
  });
}
