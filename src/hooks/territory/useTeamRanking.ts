import { useQuery } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { getTeamRanking } from '@/api/territory';

export function useTeamRanking({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: territoryKeys.teamRanking(),
    queryFn: () => getTeamRanking(),
    enabled,
  });
}
