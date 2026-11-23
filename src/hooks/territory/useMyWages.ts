import { useQuery } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getMyWages } from '@/api/territory';

interface Options {
  enabled?: boolean;
  /** 지급 직후처럼 캐시를 믿으면 안 될 때 0을 넘겨, 켤 때마다 새로 받게 한다. */
  staleTime?: number;
}

export function useMyWages(cycleId?: number, { enabled = true, staleTime }: Options = {}) {
  return useQuery({
    queryKey: territoryKeys.wages(cycleId),
    queryFn: () => getMyWages(cycleId),
    enabled,
    // undefined를 그대로 넣으면 기본 staleTime을 덮어써 0이 된다.
    ...(staleTime !== undefined && { staleTime }),
  });
}
