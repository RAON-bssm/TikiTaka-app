import { useQuery } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getTerritories } from '@/api/territory';

/** 부산 전체 땅. 대표 선발 전이면 빈 배열이다. */
export function useTerritories({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: territoryKeys.list(),
    queryFn: () => getTerritories(),
    enabled,
  });
}
