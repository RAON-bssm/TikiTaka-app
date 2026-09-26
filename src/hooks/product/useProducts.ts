import { useQuery } from '@tanstack/react-query';

import { getProducts } from '@/api/product';
import { productKeys } from '@/api/queryKeys';

export function useProducts() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: getProducts,
  });
}
