import { useMutation, useQueryClient } from '@tanstack/react-query';

import { blockUser } from '@/api/block';
import { blockKeys, postKeys, rankingKeys } from '@/api/queryKeys';

/** 차단하면 게시물·랭킹 목록에서 그 유저가 빠져야 하므로 두 도메인 다 무효화한다. */
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: rankingKeys.all });
    },
  });
}
