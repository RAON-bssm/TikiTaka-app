import { useMutation, useQueryClient } from '@tanstack/react-query';

import { purchaseProduct } from '@/api/product';
import { inventoryKeys, productKeys, userKeys } from '@/api/queryKeys';
import type { PurchaseProductRequest } from '@/types/product';

/** 구매 시 포인트가 깎이고 보유 목록이 늘어나므로 상점·인벤토리·내 정보(포인트)를 함께 무효화한다. */
export function usePurchaseProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: PurchaseProductRequest) => purchaseProduct(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      console.log('error:', error);
    },
  });
}
