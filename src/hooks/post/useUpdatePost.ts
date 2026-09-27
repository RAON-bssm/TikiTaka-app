import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePost } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import { UpdatePostRequest } from '@/types/post';

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, req }: { postId: string; req: UpdatePostRequest }) =>
      updatePost(postId, req),
    // 점수는 재심사하지 않으므로 랭킹·유저 키는 건드리지 않는다.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
