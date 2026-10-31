import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getMyPosts } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import { invalidateReviewResult } from '@/hooks/post/usePostDetail';
import type { MyPost } from '@/types/post';

export function useMyPosts() {
  const queryClient = useQueryClient();

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
        invalidateReviewResult(queryClient);
        // 지금 받는 중인 이 목록(`mine`)까지 무효화하면 요청이 취소·재시작되며 같은 비교를 반복한다.
        queryClient.invalidateQueries({
          queryKey: postKeys.lists(),
          predicate: (query) => query.queryKey[2] !== 'mine',
        });
      }
      for (const post of reviewed) {
        queryClient.invalidateQueries({ queryKey: postKeys.detail(post.post_id) });
      }

      return posts;
    },
  });
}
