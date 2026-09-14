import { useQuery } from '@tanstack/react-query';

import { getMatchStage } from '@/api/match';
import { matchKeys } from '@/api/queryKeys';

/** 현재 시즌·라운드 조회 훅. */
export function useMatchStage() {
  return useQuery({
    queryKey: matchKeys.stage(),
    queryFn: getMatchStage,
  });
}
