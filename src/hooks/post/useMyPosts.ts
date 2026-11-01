import { hashKey, useQuery, useQueryClient } from '@tanstack/react-query';

import { getMyPosts } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import { invalidateScoreQueries } from '@/hooks/post/invalidateScoreQueries';
import useAppIsActive from '@/hooks/useAppIsActive';
import type { MyPost } from '@/types/post';

const REVIEW_POLL_INTERVAL_MS = 30 * 1000;

/**
 * 심사 결과로 바뀌는 점수·포인트·랭킹은 이 목록에서 PENDING이 끝난 글을 발견할 때 갱신된다.
 * 그래서 심사 중인 글이 있으면, 앱이 앞에 있는 동안 이 목록을 주기적으로 다시 받는다.
 */
export function useMyPosts() {
  const queryClient = useQueryClient();
  const isAppActive = useAppIsActive();

  return useQuery({
    queryKey: postKeys.mine(),
    queryFn: async () => {
      const previous = queryClient.getQueryData<MyPost[]>(postKeys.mine());
      const posts = await getMyPosts();

      const pendingIds = new Set(
        previous?.filter((post) => post.status === 'PENDING').map((post) => post.post_id),
      );
      const reviewed = posts.filter(
        (post) => pendingIds.has(post.post_id) && post.status !== 'PENDING',
      );
      if (reviewed.some((post) => post.status === 'DONE')) {
        invalidateScoreQueries(queryClient);
        // 지금 받는 중인 이 목록(`mine`)까지 무효화하면 요청이 취소·재시작되며 같은 비교를 반복한다.
        queryClient.invalidateQueries({
          queryKey: postKeys.lists(),
          predicate: (query) => query.queryHash !== hashKey(postKeys.mine()),
        });
      }
      for (const post of reviewed) {
        queryClient.invalidateQueries({ queryKey: postKeys.detail(post.post_id) });
      }

      return posts;
    },
    refetchInterval: (query) =>
      isAppActive && query.state.data?.some((post) => post.status === 'PENDING')
        ? REVIEW_POLL_INTERVAL_MS
        : false,
  });
}
