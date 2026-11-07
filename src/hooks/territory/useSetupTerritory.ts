import { useMutation, useQueryClient } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { setupTerritory } from '@/api/territory';
import type { SetupTerritoryRequest } from '@/types/territory';

export function useSetupTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dongCode, ...req }: SetupTerritoryRequest & { dongCode: number }) =>
      setupTerritory(dongCode, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: territoryKeys.all });
    },
  });
}
