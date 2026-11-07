import { useQuery } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getDevelopments } from '@/api/territory';

export function useDevelopments(dongCode: number | undefined) {
  return useQuery({
    queryKey: territoryKeys.developments(dongCode ?? 0),
    queryFn: () => getDevelopments(dongCode as number),
    enabled: dongCode !== undefined,
  });
}
