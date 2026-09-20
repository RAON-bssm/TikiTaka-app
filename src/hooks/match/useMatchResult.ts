import { useQuery } from '@tanstack/react-query';

import { getMatchResult } from '@/api/match';
import { matchKeys } from '@/api/queryKeys';

/** 직전 라운드 경기 결과 조회 훅. 끝난 라운드가 없으면 빈 배열이 내려온다. */
export function useMatchResult() {
  return useQuery({
    queryKey: matchKeys.result(),
    queryFn: getMatchResult,
  });
}
