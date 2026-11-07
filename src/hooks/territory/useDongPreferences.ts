import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getDongPreferences, updateDongPreferences } from '@/api/territory';

export function useDongPreferences() {
  return useQuery({
    queryKey: territoryKeys.preferences(),
    queryFn: getDongPreferences,
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
