import { useQuery } from '@tanstack/react-query';

import { getBoards } from '@/api/post';
import { boardKeys } from '@/api/queryKeys';

export function useBoards() {
  return useQuery({
    queryKey: boardKeys.list(),
    queryFn: getBoards,
  });
}
