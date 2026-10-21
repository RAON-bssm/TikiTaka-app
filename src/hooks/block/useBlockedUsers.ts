import { useQuery } from '@tanstack/react-query';

import { getBlockedUsers } from '@/api/block';
import { blockKeys } from '@/api/queryKeys';

export function useBlockedUsers() {
  return useQuery({
    queryKey: blockKeys.list(),
    queryFn: getBlockedUsers,
  });
}
