import { useQuery } from '@tanstack/react-query';

import { getInventory } from '@/api/inventory';
import { inventoryKeys } from '@/api/queryKeys';

/** 보유 아이템 목록 조회. */
export function useInventory() {
  return useQuery({
    queryKey: inventoryKeys.list(),
    queryFn: getInventory,
  });
}
