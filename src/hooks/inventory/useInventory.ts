import { useQuery } from '@tanstack/react-query';

import { getInventory } from '@/api/inventory';
import { inventoryKeys } from '@/api/queryKeys';

export function useInventory() {
  return useQuery({
    queryKey: inventoryKeys.list(),
    queryFn: getInventory,
  });
}
