import type { Query, QueryClient } from '@tanstack/react-query';

import { postKeys } from '@/api/queryKeys';
import { hasPost, type PostListCache } from './postListCache';

/** 다음 페이지를 받는 중이라, 끝난 뒤 다시 받기로 예약해 둔 목록. 여러 카드가 실패해도 한 번만 예약한다. */
const pendingAfterNextPage = new WeakSet<Query>();

/**
 * 다음 페이지 요청이 끝나면 목록 전체를 한 번 더 받는다. `cancelRefetch: false`로 무효화하면 진행 중인
 * 다음 페이지 요청을 그대로 재사용해, 이미 받은 앞 페이지의 만료된 URL은 새로 받지 못하기 때문이다.
 */
function refetchAfterNextPage(queryClient: QueryClient, query: Query) {
  if (pendingAfterNextPage.has(query)) return;
  pendingAfterNextPage.add(query);
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.query !== query) return;
    const removed = event.type === 'removed';
    if (!removed && query.state.fetchStatus !== 'idle') return;
    unsubscribe();
    pendingAfterNextPage.delete(query);
    if (removed) return;
    void queryClient.invalidateQueries(
      { queryKey: query.queryKey, exact: true },
      { cancelRefetch: false },
    );
  });
}

/**
 * 이미지 요청이 만료된 presigned URL(발급 후 10분)로 실패했을 때, 새 URL을 받도록 그 글이 든
 * 목록·상세 쿼리를 다시 받는다. 캐시에 이미 저장된 이미지 자체는 건드리지 않는다.
 * 스크롤하다 새로 그려진 카드 여러 장이 한꺼번에 실패하면 이 함수가 연달아 불린다. 받는 중인 요청을
 * 취소하고 처음부터 다시 받지 않도록(`cancelRefetch: false`) 해, 같은 목록은 한 번만 받는다.
 */
export function invalidateImageUrls(queryClient: QueryClient, postId: string) {
  const containsPost = (query: Query) =>
    hasPost(query.state.data as PostListCache | undefined, postId);

  for (const query of queryClient.getQueryCache().findAll({ queryKey: postKeys.lists() })) {
    if (
      query.state.fetchStatus === 'fetching' &&
      query.state.fetchMeta?.fetchMore &&
      containsPost(query)
    ) {
      refetchAfterNextPage(queryClient, query);
    }
  }
  void queryClient.invalidateQueries(
    { queryKey: postKeys.lists(), predicate: containsPost },
    { cancelRefetch: false },
  );
  void queryClient.invalidateQueries(
    { queryKey: postKeys.detail(postId) },
    { cancelRefetch: false },
  );
}
