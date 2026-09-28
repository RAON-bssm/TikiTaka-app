import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likePost, unlikePost } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import type { MyPost, Post, PostDetail } from '@/types/post';

type LikeFields = Pick<PostDetail, 'like_count' | 'liked_by_me'>;

function applyLike<T extends LikeFields>(target: T, liked: boolean): T {
  if (target.liked_by_me === liked) return target;
  return { ...target, liked_by_me: liked, like_count: target.like_count + (liked ? 1 : -1) };
}

/**
 * `liked`는 바꿀 목표 상태다. 서버가 좋아요 수를 돌려주지 않아 목록·상세 캐시에 먼저 반영하고, 끝나면 다시 받는다.
 * 연타하면 요청 도착 순서가 뒤바뀌어 마지막 상태와 다르게 저장될 수 있어, 게시물별 scope로 직렬화한다.
 */
export function useTogglePostLike(postId: string) {
  const queryClient = useQueryClient();
  const detailKey = postKeys.detail(postId);

  return useMutation({
    scope: { id: `post-like-${postId}` },
    mutationFn: (liked: boolean) => (liked ? likePost(postId) : unlikePost(postId)),
    onMutate: async (liked) => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });
      const previousDetail = queryClient.getQueryData<PostDetail>(detailKey);
      // 내 게시물 목록(`mine`)도 lists() 아래지만 좋아요 필드가 없어 건드리지 않는다.
      const previousLists = queryClient.getQueriesData<Post[] | MyPost[]>({
        queryKey: postKeys.lists(),
      });

      if (previousDetail) queryClient.setQueryData(detailKey, applyLike(previousDetail, liked));
      for (const [key, posts] of previousLists) {
        if (!posts) continue;
        queryClient.setQueryData(
          key,
          posts.map((post) =>
            post.post_id === postId && 'liked_by_me' in post ? applyLike(post, liked) : post,
          ),
        );
      }
      return { previousDetail, previousLists };
    },
    onError: (_error, _liked, context) => {
      if (!context) return;
      if (context.previousDetail) queryClient.setQueryData(detailKey, context.previousDetail);
      for (const [key, posts] of context.previousLists) {
        queryClient.setQueryData(key, posts);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });
}
