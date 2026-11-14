import type { QueryClient } from '@tanstack/react-query';

import { postKeys } from '@/api/queryKeys';
import { hasPost, type PostListCache } from './postListCache';

/**
 * 이미지 요청이 만료된 presigned URL(발급 후 10분)로 실패했을 때, 새 URL을 받도록 그 글이 든
 * 목록·상세 쿼리를 다시 받는다. 캐시에 이미 저장된 이미지 자체는 건드리지 않는다.
 * 스크롤하다 새로 그려진 카드 여러 장이 한꺼번에 실패하면 이 함수가 연달아 불린다. 받는 중인 요청을
 * 취소하고 처음부터 다시 받지 않도록(`cancelRefetch: false`) 해, 같은 목록은 한 번만 받는다.
 */
export function invalidateImageUrls(queryClient: QueryClient, postId: string) {
  void queryClient.invalidateQueries(
    {
      queryKey: postKeys.lists(),
      predicate: (query) => hasPost(query.state.data as PostListCache | undefined, postId),
    },
    { cancelRefetch: false },
  );
  void queryClient.invalidateQueries(
    { queryKey: postKeys.detail(postId) },
    { cancelRefetch: false },
  );
}
