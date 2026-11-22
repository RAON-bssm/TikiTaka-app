import { useQuery } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getMyWages } from '@/api/territory';

export function useMyWages(cycleId?: number, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: territoryKeys.wages(cycleId),
    queryFn: () => getMyWages(cycleId),
    enabled,
  });
}
