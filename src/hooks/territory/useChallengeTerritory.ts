import { useMutation, useQueryClient } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { challengeTerritory } from '@/api/territory';
import type { ChallengeRequest } from '@/types/territory';
import { syncMyPoint } from './syncMyPoint';

/** 차지하면 주인·방어 점수·팀 순위가 바뀌고, 실패해도 통행료가 주인에게 가므로 땅따먹기 전체를 다시 받는다. */
export function useChallengeTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dongCode, ...req }: ChallengeRequest & { dongCode: number }) =>
      challengeTerritory(dongCode, req),
    onSuccess: (result) => {
      queryClient.setQueryData(territoryKeys.challenge(result.challenge_id), result);
      syncMyPoint(queryClient, result.my_point);
      queryClient.invalidateQueries({ queryKey: territoryKeys.all });
    },
  });
}
