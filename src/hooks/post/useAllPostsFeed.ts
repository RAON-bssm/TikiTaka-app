import { skipToken, useInfiniteQuery } from '@tanstack/react-query';

import { getPosts, type PostPage } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import type { Post } from '@/types/post';
import type { CurrentBoardFeedState } from './useCurrentBoardFeed';
import { useBoards } from './useBoards';

/** 게시판마다 어디까지 받았는지와, 받았지만 아직 내보내지 않은 글. */
interface BoardCursor {
  boardId: number;
  cursor?: string;
  done: boolean;
  buffer: Post[];
}

type MergedPage = PostPage & { next?: BoardCursor[] };

const isNewer = (a: Post, b: Post) => a.created_at > b.created_at;

/**
 * 전체 글 API가 없어 게시판별 목록을 최신순으로 합친다(k-way 병합).
 * 게시판마다 최신순으로 오므로, 각 게시판의 맨 앞 글 중 가장 최신 글을 하나씩 꺼낸다.
 * 맨 앞이 빈 게시판은 다음 페이지를 먼저 받아야 순서가 틀어지지 않는다.
 */
async function fetchMergedPage(state: BoardCursor[], size: number): Promise<MergedPage> {
  const boards = state.map((board) => ({ ...board, buffer: [...board.buffer] }));
  const posts: Post[] = [];

  while (posts.length < size) {
    await Promise.all(
      boards
        .filter((board) => board.buffer.length === 0 && !board.done)
        .map(async (board) => {
          const page = await getPosts(board.boardId, { size, cursor: board.cursor });
          board.buffer.push(...page.posts);
          board.cursor = page.nextCursor;
          board.done = !page.nextCursor;
        }),
    );
    const heads = boards.filter((board) => board.buffer.length > 0);
    if (heads.length === 0) break;
    const newest = heads.reduce((a, b) => (isNewer(b.buffer[0], a.buffer[0]) ? b : a));
    posts.push(newest.buffer.shift() as Post);
  }

  const hasMore = boards.some((board) => board.buffer.length > 0 || !board.done);
  return { posts, next: hasMore ? boards : undefined };
}

/** 진행 중인 모든 대결 게시판의 글을 최신순으로. `size`는 한 번에 보여 줄 글 수다. */
export function useAllPostsFeed(size: number): CurrentBoardFeedState {
  const boards = useBoards();
  const boardIds = boards.data?.map((board) => board.board_id) ?? [];

  const feed = useInfiniteQuery({
    queryKey: postKeys.everyBoard(boardIds, size),
    queryFn:
      boardIds.length === 0
        ? skipToken
        : ({ pageParam }: { pageParam: BoardCursor[] | undefined }) =>
            fetchMergedPage(
              pageParam ?? boardIds.map((boardId) => ({ boardId, done: false, buffer: [] })),
              size,
            ),
    initialPageParam: undefined as BoardCursor[] | undefined,
    getNextPageParam: (lastPage: MergedPage) => lastPage.next,
  });

  return {
    board: boards.data?.[0],
    posts: feed.data?.pages.flatMap((page) => page.posts) ?? [],
    isLoading: boards.isLoading || feed.isLoading,
    // 다음 페이지만 실패해도 쿼리 전체가 error가 된다. 그때 이미 받은 글까지 실패 화면으로 바꾸지 않는다.
    isError: boards.isError || (feed.isError && !feed.data),
    refetch: async () => {
      // 게시판이 없을 때 refetch하면 skipToken 에러가 난다.
      await Promise.all([boards.refetch(), boardIds.length > 0 ? feed.refetch() : undefined]);
    },
    fetchNextPage: () => {
      if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
    },
    hasNextPage: feed.hasNextPage,
    isFetchingNextPage: feed.isFetchingNextPage,
    isFetchNextPageError: feed.isFetchNextPageError,
  };
}
