import { useQuery } from '@tanstack/react-query';

import { getGashapons } from '@/api/product';
import { productKeys } from '@/api/queryKeys';

export function useGashapons() {
  return useQuery({
    queryKey: productKeys.gashapon(),
    queryFn: getGashapons,
  });
}
