import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likePost, unlikePost } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import type { PostDetail } from '@/types/post';

/**
 * `liked`는 바꿀 목표 상태다. 서버가 좋아요 수를 돌려주지 않아, 상세는 먼저 반영해 두고 끝나면 목록·상세를 다시 받는다.
 * 연타하면 요청 도착 순서가 뒤바뀌어 마지막 상태와 다르게 저장될 수 있어, 게시물별 scope로 직렬화한다.
 */
export function useTogglePostLike(postId: string) {
  const queryClient = useQueryClient();
  const key = postKeys.detail(postId);

  return useMutation({
    scope: { id: `post-like-${postId}` },
    mutationFn: (liked: boolean) => (liked ? likePost(postId) : unlikePost(postId)),
    onMutate: async (liked) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PostDetail>(key);
      if (previous && previous.liked_by_me !== liked) {
        queryClient.setQueryData<PostDetail>(key, {
          ...previous,
          liked_by_me: liked,
          like_count: previous.like_count + (liked ? 1 : -1),
        });
      }
      return { previous };
    },
    onError: (_error, _liked, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });
}
