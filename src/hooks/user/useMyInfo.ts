import { useQuery } from '@tanstack/react-query';

import { userKeys } from '@/api/queryKeys';
import { getMyInfo } from '@/api/user';

/**
 * 내 정보 조회 훅. 동네를 id까지 받아야 하는 화면에서 쓴다.
 *
 * 동네를 고르거나 지역 스위칭 예약 상태(`pending_location_swap`)를 봐야 하면 이쪽,
 * 이름·동네 이름·순위만 보여주면 되면 `useMyProfile`을 쓴다.
 */
export function useMyInfo() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getMyInfo,
  });
}
