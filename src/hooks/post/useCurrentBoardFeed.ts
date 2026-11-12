import { skipToken, useInfiniteQuery } from '@tanstack/react-query';

import { getPosts } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import type { Board, Post } from '@/types/post';
import { useBoards } from './useBoards';

// 첫 요청도 size를 명시해야 서버가 페이지네이션 경로를 탄다(size·cursor 둘 다 없으면 옛 전체 목록 응답).
const FEED_PAGE_SIZE = 20;

export interface CurrentBoardFeedState {
  /** 없으면 진행 중인 라운드가 없는 것이다. */
  board?: Board;
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

/** 피드 화면 전용 무한 스크롤. 홈 미리보기(`useCurrentBoardPosts`)와 달리 커서로 이어 받는다. */
export function useCurrentBoardFeed(): CurrentBoardFeedState {
  const boards = useBoards();
  const board = boards.data?.[0];
  const boardId = board?.board_id;

  const feed = useInfiniteQuery({
    queryKey: postKeys.feed(boardId ?? 0),
    queryFn:
      boardId === undefined
        ? skipToken
        : ({ pageParam }: { pageParam?: string }) =>
            getPosts(boardId, { size: FEED_PAGE_SIZE, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return {
    board,
    posts: feed.data?.pages.flatMap((page) => page.posts) ?? [],
    isLoading: boards.isLoading || feed.isLoading,
    isError: boards.isError || feed.isError,
    refetch: async () => {
      // 게시판이 바뀌면 쿼리 키가 바뀌어 새로 받는다. 게시판이 없을 때 refetch하면 skipToken 에러가 난다.
      await Promise.all([boards.refetch(), board ? feed.refetch() : undefined]);
    },
    fetchNextPage: () => {
      if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
    },
    hasNextPage: feed.hasNextPage,
    isFetchingNextPage: feed.isFetchingNextPage,
  };
}
