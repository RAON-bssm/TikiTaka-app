import { useQuery } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getRepresentatives } from '@/api/territory';

/** `locationId`를 빼면 부산 전체 대표를 준다. */
export function useRepresentatives(
  locationId?: number,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: territoryKeys.representatives(locationId),
    queryFn: () => getRepresentatives({ locationId }),
    enabled,
  });
}
