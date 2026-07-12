import { useQuery } from '@tanstack/react-query';

import { getBoards } from '@/api/post';

export function useBoards() {
  return useQuery({
    queryKey: ['boards'],
    queryFn: getBoards,
  });
}
