import { useQuery } from '@tanstack/react-query';

import { userKeys } from '@/api/queryKeys';
import { getMyInfo } from '@/api/user';

/** 동네 id·스위칭 예약 상태가 필요한 화면용. 표시만 하면 되면 `useMyProfile`. */
export function useMyInfo() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getMyInfo,
  });
}
