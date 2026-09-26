import type { Board, Post } from '@/types/post';
import { useBoards } from './useBoards';
import { usePosts } from './usePosts';

export interface CurrentBoardPostsState {
  /** 없으면 진행 중인 라운드가 없는 것이다. */
  board?: Board;
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

/** 서버가 내 매치를 맨 앞에 두므로, 내 매치가 없으면 다른 동네 게시판을 구경하게 된다. */
export function useCurrentBoardPosts(): CurrentBoardPostsState {
  const boards = useBoards();
  const board = boards.data?.[0];
  const posts = usePosts(board?.board_id);

  return {
    board,
    posts: posts.data ?? [],
    isLoading: boards.isLoading || posts.isLoading,
    isError: boards.isError || posts.isError,
    refetch: async () => {
      // 게시판이 바뀌면 usePosts가 새 키로 다시 받는다. 게시판이 없을 때 refetch하면 skipToken 에러가 난다.
      await Promise.all([boards.refetch(), board ? posts.refetch() : undefined]);
    },
  };
}
