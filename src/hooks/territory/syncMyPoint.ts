import type { QueryClient } from '@tanstack/react-query';

import { userKeys } from '@/api/queryKeys';
import type { UserInfo } from '@/types/user';

/** 응답의 `my_point`로 내 정보 캐시를 바로 맞추고, 같은 값을 들고 있는 프로필은 다시 받는다. */
export function syncMyPoint(queryClient: QueryClient, point: number | undefined) {
  if (point === undefined) return;
  queryClient.setQueryData<UserInfo>(userKeys.me(), (prev) => (prev ? { ...prev, point } : prev));
  queryClient.invalidateQueries({ queryKey: userKeys.profile() });
}
