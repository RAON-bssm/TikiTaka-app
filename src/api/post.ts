import type { ApiResponse } from '@/types/api';
import type { Board, BoardListData, Post, PostListData } from '@/types/post';
import client from './client';

export async function getBoards(): Promise<Board[]> {
  const { data } = await client.get<ApiResponse<BoardListData>>(`/api/board`);
  return data.data.board;
}

export async function getPosts(boardId: number): Promise<Post[]> {
  const { data } = await client.get<ApiResponse<PostListData>>(`/api/post/${boardId}`);
  return data.data.post;
}
