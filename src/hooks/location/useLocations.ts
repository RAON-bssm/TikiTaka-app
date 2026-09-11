import { useQuery } from '@tanstack/react-query';

import { getLocations } from '@/api/location';
import { locationKeys } from '@/api/queryKeys';

export function useLocations() {
  return useQuery({
    queryKey: locationKeys.list(),
    queryFn: getLocations,
    // 동네 목록은 사실상 바뀌지 않아 자동 재요청을 끈다. 앱을 다시 켜면 새로 받는다.
    staleTime: Infinity,
  });
}
