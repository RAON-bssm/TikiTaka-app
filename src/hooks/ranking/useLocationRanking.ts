import { useQuery } from '@tanstack/react-query';

import { getLocationRanking } from '@/api/ranking';
import { rankingKeys } from '@/api/queryKeys';

/** 동네 랭킹 조회 훅. */
export function useLocationRanking() {
  return useQuery({
    queryKey: rankingKeys.location(),
    queryFn: getLocationRanking,
  });
}
