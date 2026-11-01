import type { QueryClient } from '@tanstack/react-query';

import { rankingKeys, userKeys } from '@/api/queryKeys';

/**
 * 동네·개인 점수와 포인트가 바뀌는 시점(심사 완료, 점수가 반영된 글 삭제)에 랭킹·유저 캐시를 갱신한다.
 * 비동기 심사에서는 업로드가 아니라 심사가 끝난 시점이다.
 */
export function invalidateScoreQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: rankingKeys.all });
  queryClient.invalidateQueries({ queryKey: userKeys.all });
}
