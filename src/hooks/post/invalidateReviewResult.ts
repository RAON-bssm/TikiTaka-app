import type { QueryClient } from '@tanstack/react-query';

import { rankingKeys, userKeys } from '@/api/queryKeys';

/** 비동기 심사에서는 점수·포인트·랭킹이 업로드가 아니라 심사가 끝난 시점에 바뀐다. */
export function invalidateReviewResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: rankingKeys.all });
  queryClient.invalidateQueries({ queryKey: userKeys.all });
}
