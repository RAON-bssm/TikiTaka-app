import { useQuery } from '@tanstack/react-query';

import { getPosts } from '@/api/post';
import { postKeys } from '@/api/queryKeys';

export function usePosts(boardId: number) {
  return useQuery({
    queryKey: postKeys.list(boardId),
    queryFn: () => getPosts(boardId),
  });
}
