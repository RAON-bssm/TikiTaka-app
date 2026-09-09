import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userKeys } from '@/api/queryKeys';
import { setSubLocation } from '@/api/user';

/**
 * 서브 동네 설정 훅.
 *
 * 서브 동네는 점수 소속을 바꾸지 않아(교환은 지역 스위칭이 한다) user 키만 무효화한다.
 *
 * 실패는 전부 400으로 오고 사유가 message로만 구분되므로, 화면에서
 * `getApiErrorMessage`로 서버 문구를 그대로 보여준다.
 */
export function useSetSubLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: number) => setSubLocation(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
