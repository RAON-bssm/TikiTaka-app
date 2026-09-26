import { useQuery } from '@tanstack/react-query';

import { getUserRanking } from '@/api/ranking';
import { rankingKeys } from '@/api/queryKeys';

/** `my_ranking`은 이번 라운드 미참여 시 응답에 없을 수 있다. */
export function useUserRanking() {
  return useQuery({
    queryKey: rankingKeys.user(),
    queryFn: getUserRanking,
  });
}
