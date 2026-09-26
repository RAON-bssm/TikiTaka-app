import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePost } from '@/api/post';
import { postKeys, rankingKeys, userKeys } from '@/api/queryKeys';

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      // 상세는 무효화하지 않는다. 삭제된 글을 다시 받으면 404라 상세 화면을 벗어나기 전에 에러 화면이 번쩍인다.
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      // 게시물 작성·삭제는 서버에서 동네·개인 점수를 바꾸므로 랭킹·유저 키도 함께 무효화한다.
      queryClient.invalidateQueries({ queryKey: rankingKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
