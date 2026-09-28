import { useMutation, useQueryClient } from '@tanstack/react-query';

import { drawGashapon } from '@/api/product';
import { inventoryKeys, productKeys, userKeys } from '@/api/queryKeys';
import type { DrawGashaponRequest } from '@/types/product';

/** 뽑은 상품이 보유 목록으로 옮겨 가고 포인트가 깎이므로 구매와 같은 키를 무효화한다. */
export function useDrawGashapon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: DrawGashaponRequest) => drawGashapon(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
