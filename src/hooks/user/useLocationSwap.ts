import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userKeys } from '@/api/queryKeys';
import { cancelLocationSwap, requestLocationSwap } from '@/api/user';

/**
 * 예약일 뿐 동네가 그 자리에서 바뀌지 않는다. 달라지는 값은 `/api/user/me`의
 * `pending_location_swap`뿐이라 user 키만 무효화한다(점수는 아직 안 움직인다).
 */
export function useRequestLocationSwap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestLocationSwap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useCancelLocationSwap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelLocationSwap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
