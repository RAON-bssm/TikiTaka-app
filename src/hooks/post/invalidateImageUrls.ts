import type { QueryClient } from '@tanstack/react-query';

import { postKeys } from '@/api/queryKeys';

/**
 * 이미지 요청이 만료된 presigned URL(발급 후 10분)로 실패했을 때, 새 URL을 받도록 그 글이
 * 나올 수 있는 목록·상세 쿼리를 다시 받는다. 캐시에 이미 저장된 이미지 자체는 건드리지 않는다.
 */
export function invalidateImageUrls(queryClient: QueryClient, postId?: string) {
  queryClient.invalidateQueries({ queryKey: postKeys.lists() });
  if (postId) queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
}
