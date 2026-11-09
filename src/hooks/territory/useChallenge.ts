import { useQuery } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getChallenge } from '@/api/territory';

/** 결과 화면 재진입용. 도전 직후에는 도전 응답을 캐시에 넣어 두므로 다시 요청하지 않는다. */
export function useChallenge(challengeId: string | undefined) {
  return useQuery({
    queryKey: territoryKeys.challenge(challengeId ?? ''),
    queryFn: () => getChallenge(challengeId as string),
    enabled: !!challengeId,
    staleTime: Infinity,
  });
}
