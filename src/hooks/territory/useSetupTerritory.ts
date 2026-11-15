import { useMutation, useQueryClient } from '@tanstack/react-query';

import { trackEvent } from '@/api/analytics';
import { territoryKeys } from '@/api/queryKeys';
import { setupTerritory } from '@/api/territory';
import type { SetupTerritoryRequest } from '@/types/territory';

export function useSetupTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dongCode, ...req }: SetupTerritoryRequest & { dongCode: number }) =>
      setupTerritory(dongCode, req),
    onSuccess: () => {
      trackEvent('territory_setup');
      queryClient.invalidateQueries({ queryKey: territoryKeys.all });
    },
  });
}
