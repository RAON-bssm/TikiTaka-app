import { type QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';

import { getPostDetail } from '@/api/post';
import { postKeys, rankingKeys, userKeys } from '@/api/queryKeys';
import type { PostDetail } from '@/types/post';

// 심사는 몇 분에서 수십 분 걸려(서버 AI 호출이 분당 4건 제한) 짧게 확인해 봐야 요청만 늘어난다.
const REVIEW_POLL_INTERVAL_MS = 30 * 1000;

/** 비동기 심사에서는 점수·포인트·랭킹이 업로드가 아니라 심사가 끝난 시점에 바뀐다. */
export function invalidateReviewResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: rankingKeys.all });
  queryClient.invalidateQueries({ queryKey: userKeys.all });
}

export function usePostDetail(postId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: async () => {
      const previous = queryClient.getQueryData<PostDetail>(postKeys.detail(postId));
      const post = await getPostDetail(postId);
      if (previous?.status === 'PENDING' && post.status !== 'PENDING') {
        if (post.status === 'DONE') invalidateReviewResult(queryClient);
        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      }
      return post;
    },
    refetchInterval: (query) =>
      query.state.data?.status === 'PENDING' ? REVIEW_POLL_INTERVAL_MS : false,
  });
}
