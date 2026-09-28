import { useMutation, useQueryClient } from '@tanstack/react-query';

import { boardKeys, postKeys, userKeys } from '@/api/queryKeys';
import { moveCurrentLocation } from '@/api/user';

/** 서버가 `my_match` 게시판을 현재 지역 기준으로 정하므로 게시판·게시물 목록도 다시 받는다. */
export function useMoveCurrentLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: number) => moveCurrentLocation(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
