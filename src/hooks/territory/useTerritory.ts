import { useQuery } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getTerritory } from '@/api/territory';

/** 대표 선발 전에는 404라 `dongCode`는 땅 목록에 있는 동만 넘긴다. */
export function useTerritory(dongCode: number | undefined) {
  return useQuery({
    queryKey: territoryKeys.detail(dongCode ?? 0),
    queryFn: () => getTerritory(dongCode as number),
    enabled: dongCode !== undefined,
  });
}
