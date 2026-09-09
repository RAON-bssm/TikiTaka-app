import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userKeys } from '@/api/queryKeys';
import { cancelLocationSwap, requestLocationSwap } from '@/api/user';

/**
 * 지역 스위칭 예약·취소 훅.
 *
 * 예약해도 **동네는 그 자리에서 바뀌지 않는다.** 실제 메인↔서브 교환은 다음 라운드
 * 시작 직후 배치가 처리하므로, 성공 직후 화면에서 달라지는 값은 `/api/user/me`의
 * `pending_location_swap`뿐이다. 그래서 user 키를 무효화해 예약 상태를 다시 받아온다.
 * (점수는 아직 이동하지 않으므로 ranking 키는 건드리지 않는다)
 *
 * 예약과 취소를 한 파일에 둔 이유: 화면에서는 예약 상태를 켜고 끄는 한 쌍으로 쓴다.
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

/** 지역 스위칭 예약 취소. 다음 라운드가 시작되기 전까지만 의미가 있다. */
export function useCancelLocationSwap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelLocationSwap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
