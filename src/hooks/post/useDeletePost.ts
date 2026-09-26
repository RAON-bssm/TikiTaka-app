import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePost } from '@/api/post';
import { postKeys, rankingKeys, userKeys } from '@/api/queryKeys';

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      // 게시물 작성·삭제는 서버에서 동네·개인 점수를 바꾸므로 랭킹·유저 키도 함께 무효화한다.
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: rankingKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      console.log('error:', error);
    },
  });
}
