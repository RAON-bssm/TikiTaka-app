import { useQuery } from '@tanstack/react-query';

import { getLocationRanking } from '@/api/ranking';
import { rankingKeys } from '@/api/queryKeys';

export function useLocationRanking() {
  return useQuery({
    queryKey: rankingKeys.location(),
    queryFn: getLocationRanking,
  });
}
