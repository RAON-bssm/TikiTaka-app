import { useQuery } from '@tanstack/react-query';

import { getProducts } from '@/api/product';
import { productKeys } from '@/api/queryKeys';

/** 상점 상품 목록 조회. */
export function useProducts() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: getProducts,
  });
}
