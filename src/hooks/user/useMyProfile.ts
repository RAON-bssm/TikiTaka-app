import { useQuery } from '@tanstack/react-query';

import { userKeys } from '@/api/queryKeys';
import { getMyProfile } from '@/api/user';

/**
 * 프로필 조회 훅. 화면에 보여줄 값(닉네임·동네 이름·순위·포인트)을 받는다.
 *
 * 동네가 이름으로만 오므로 동네를 수정하는 화면에서는 쓸 수 없다. (`useMyInfo` 참고)
 */
export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getMyProfile,
  });
}
