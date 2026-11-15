import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';

import { trackEvent } from '@/api/analytics';
import { likePost, unlikePost } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import type { MyPost, Post, PostDetail } from '@/types/post';
import { mapPostList, type PostListCache } from './postListCache';

type LikeFields = Pick<PostDetail, 'like_count' | 'liked_by_me'>;

function applyLike<T extends LikeFields>(target: T, liked: boolean): T {
  if (target.liked_by_me === liked) return target;
  return { ...target, liked_by_me: liked, like_count: target.like_count + (liked ? 1 : -1) };
}

function pickLike(target: LikeFields): LikeFields {
  return { like_count: target.like_count, liked_by_me: target.liked_by_me };
}

function findPostLike(data: PostListCache, postId: string): LikeFields | undefined {
  const posts: (Post | MyPost)[] = Array.isArray(data)
    ? data
    : data.pages.flatMap((page) => page.posts);
  const post = posts.find((item) => item.post_id === postId);
  return post && pickLike(post);
}

/**
 * `liked`는 바꿀 목표 상태다. 서버가 좋아요 수를 돌려주지 않아 목록·상세 캐시에 먼저 반영하고, 끝나면 다시 받는다.
 * 연타하면 요청 도착 순서가 뒤바뀌어 마지막 상태와 다르게 저장될 수 있어, 게시물별 scope로 직렬화한다.
 */
export function useTogglePostLike(postId: string) {
  const queryClient = useQueryClient();
  const detailKey = postKeys.detail(postId);
  const scopeId = `post-like-${postId}`;

  const hasLaterInScope = () =>
    queryClient
      .getMutationCache()
      .findAll({ status: 'pending', predicate: (m) => m.options.scope?.id === scopeId }).length > 1;

  return useMutation({
    scope: { id: scopeId },
    mutationFn: (liked: boolean) => (liked ? likePost(postId) : unlikePost(postId)),
    onMutate: async (liked) => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });
      const previousDetail = queryClient.getQueryData<PostDetail>(detailKey);
      const lists = queryClient.getQueriesData<PostListCache>({ queryKey: postKeys.lists() });
      // 실패하면 이 글의 좋아요 값만 되돌린다. 캐시 전체를 되돌리면 그사이 받은 페이지 등이 사라진다.
      const previousLists: [QueryKey, LikeFields][] = [];

      if (previousDetail) queryClient.setQueryData(detailKey, applyLike(previousDetail, liked));
      for (const [key, data] of lists) {
        const previous = data && findPostLike(data, postId);
        if (!data || !previous) continue;
        previousLists.push([key, previous]);
        queryClient.setQueryData(
          key,
          mapPostList(data, (post) => (post.post_id === postId ? applyLike(post, liked) : post)),
        );
      }
      return { previousDetail: previousDetail && pickLike(previousDetail), previousLists };
    },
    onError: (_error, _liked, context) => {
      if (!context) return;
      // 같은 scope의 뒤 요청도 onMutate는 즉시 돌아 캐시가 이미 마지막 목표 상태다. 되돌리면 그걸 덮어쓴다.
      if (hasLaterInScope()) return;
      const { previousDetail } = context;
      if (previousDetail) {
        queryClient.setQueryData<PostDetail>(
          detailKey,
          (current) => current && { ...current, ...previousDetail },
        );
      }
      for (const [key, previous] of context.previousLists) {
        queryClient.setQueryData<PostListCache>(
          key,
          (current) =>
            current &&
            mapPostList(current, (post) =>
              post.post_id === postId ? { ...post, ...previous } : post,
            ),
        );
      }
    },
    onSuccess: (_data, liked) => {
      if (liked) trackEvent('post_like');
    },
    onSettled: () => {
      if (hasLaterInScope()) return;
      return queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
