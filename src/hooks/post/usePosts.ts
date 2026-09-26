import { skipToken, useQuery } from '@tanstack/react-query';

import { getPosts } from '@/api/post';
import { postKeys } from '@/api/queryKeys';

/** 게시판 목록을 받기 전에는 boardId가 없어 요청하지 않는다. */
export function usePosts(boardId: number | undefined) {
  return useQuery({
    queryKey: postKeys.list(boardId ?? 0),
    queryFn: boardId === undefined ? skipToken : () => getPosts(boardId),
  });
}
