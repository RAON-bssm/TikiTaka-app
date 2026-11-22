import { useQuery } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getMyWages } from '@/api/territory';

/** 일급은 새벽 배치로 지급돼 앱의 동작으로 바뀌지 않는다. 땅 관련 변경 때 `territoryKeys.all` 무효화로 함께 갱신된다. */
export function useMyWages(cycleId?: number) {
  return useQuery({
    queryKey: territoryKeys.wages(cycleId),
    queryFn: () => getMyWages(cycleId),
  });
}
