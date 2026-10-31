import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePost } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import { invalidateScoreQueries } from '@/hooks/post/invalidateScoreQueries';

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      // 상세는 무효화하지 않는다. 삭제된 글을 다시 받으면 404라 상세 화면을 벗어나기 전에 에러 화면이 번쩍인다.
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      // 점수가 반영된 글을 지우면 서버가 동네·개인 점수를 차감한다. 심사 전 글은 차감이 없지만 구분할 필요는 없다.
      invalidateScoreQueries(queryClient);
    },
  });
}
