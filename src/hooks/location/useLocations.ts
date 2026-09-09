import { useQuery } from '@tanstack/react-query';

import { getLocations } from '@/api/location';
import { locationKeys } from '@/api/queryKeys';

/**
 * 동네 목록 조회 훅. 동네를 고르는 화면(회원가입·동네 수정)의 선택지 출처다.
 *
 * 목록은 서버에서 사실상 바뀌지 않으므로 전역 기본값(60초)을 덮어써 자동 재요청을 끈다.
 * 앱을 다시 켜면 어차피 새로 받는다.
 */
export function useLocations() {
  return useQuery({
    queryKey: locationKeys.list(),
    queryFn: getLocations,
    staleTime: Infinity,
  });
}
