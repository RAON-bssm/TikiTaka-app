import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getDongPreferences, updateDongPreferences } from '@/api/territory';

export function useDongPreferences({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: territoryKeys.preferences(),
    queryFn: getDongPreferences,
    enabled,
  });
}

export function useUpdateDongPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dongCodes: number[]) => updateDongPreferences({ dong_codes: dongCodes }),
    onSuccess: (preferences) => {
      queryClient.setQueryData(territoryKeys.preferences(), preferences);
    },
  });
}
