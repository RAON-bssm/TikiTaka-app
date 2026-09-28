import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userKeys } from '@/api/queryKeys';
import { cancelLocationChange, reserveLocationChange } from '@/api/user';

/**
 * 예약일 뿐 동네가 그 자리에서 바뀌지 않는다. 달라지는 값은 내 정보의
 * `pending_location`뿐이라 user 키만 무효화한다(점수·게시판은 아직 안 움직인다).
 */
export function useReserveLocationChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: number) => reserveLocationChange(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useCancelLocationChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelLocationChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
