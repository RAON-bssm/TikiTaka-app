import { useQuery } from '@tanstack/react-query';

import { userKeys } from '@/api/queryKeys';
import { getMyProfile } from '@/api/user';

/** 표시용. 동네가 이름으로만 와서 동네를 수정하는 화면에서는 쓸 수 없다. (`useMyInfo`) */
export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getMyProfile,
  });
}
