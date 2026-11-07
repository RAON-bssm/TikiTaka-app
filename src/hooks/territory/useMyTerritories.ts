import { useQuery } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getMyTerritories } from '@/api/territory';

export function useMyTerritories({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: territoryKeys.mine(),
    queryFn: getMyTerritories,
    enabled,
  });
}
