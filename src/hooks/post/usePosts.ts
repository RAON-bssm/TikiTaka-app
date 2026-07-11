import { useQuery } from '@tanstack/react-query';

import { getPosts } from '@/api/post';

/**
 * 게시판(board_id)의 게시물 목록 조회 훅.
 *
 * queryKey에 boardId를 넣어 게시판마다 캐시를 분리한다.
 * 화면은 { data, isLoading, isError } 만 꽂으면 로딩·에러·캐싱이 자동으로 처리된다.
 */
export function usePosts(boardId: number) {
  return useQuery({
    queryKey: ['posts', boardId],
    queryFn: () => getPosts(boardId),
  });
}
