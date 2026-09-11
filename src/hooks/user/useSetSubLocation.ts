import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userKeys } from '@/api/queryKeys';
import { setSubLocation } from '@/api/user';

export function useSetSubLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: number) => setSubLocation(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
