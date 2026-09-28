import { useQuery } from '@tanstack/react-query';

import { getBoards } from '@/api/post';
import { boardKeys } from '@/api/queryKeys';

/**
 * 글을 쓸 수 있는 게시판(`my_match`). 목록의 첫 항목은 내 매치가 없으면 남의 게시판이라 쓰면 안 된다.
 * 내 매치가 없으면 null.
 */
export function useMyBoard() {
  return useQuery({
    queryKey: boardKeys.list(),
    queryFn: getBoards,
    select: (boards) => boards.find((board) => board.my_match) ?? null,
  });
}
