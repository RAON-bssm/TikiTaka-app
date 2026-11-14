import { skipToken, useQuery } from '@tanstack/react-query';

import { getPosts } from '@/api/post';
import { postKeys } from '@/api/queryKeys';

/**
 * 게시판 글의 첫 페이지만 받는다(무한 스크롤 아님). 홈 미리보기처럼 `size`를 작게 주고 더는 안 받을 때 쓴다.
 * 게시판 목록을 받기 전에는 boardId가 없어 요청하지 않는다.
 */
export function usePosts(boardId: number | undefined, size?: number) {
  return useQuery({
    queryKey: postKeys.list(boardId ?? 0, size),
    queryFn:
      boardId === undefined
        ? skipToken
        : () => getPosts(boardId, { size }).then((page) => page.posts),
  });
}
