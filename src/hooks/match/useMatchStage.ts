import { useQuery } from '@tanstack/react-query';

import { getMatchStage } from '@/api/match';
import { matchKeys } from '@/api/queryKeys';

export function useMatchStage() {
  return useQuery({
    queryKey: matchKeys.stage(),
    queryFn: getMatchStage,
  });
}
