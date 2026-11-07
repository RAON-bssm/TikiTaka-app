import { useMutation, useQueryClient } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { developTerritory } from '@/api/territory';
import { syncMyPoint } from './syncMyPoint';

/** 실패도 HTTP 200(`success: false`)이라 onSuccess에서 결과를 나눠 보여준다. */
export function useDevelopTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dongCode: number) => developTerritory(dongCode),
    onSuccess: (result) => {
      syncMyPoint(queryClient, result.my_point);
      queryClient.invalidateQueries({ queryKey: territoryKeys.all });
    },
  });
}
