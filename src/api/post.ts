import client from './client';
import type { ApiResponse } from '@/types/api';
import type { Post, PostListData } from '@/types/post';

/**
 * 게시판(board_id)의 게시물 목록을 조회한다.
 * GET /api/post/{board_id}
 *
 * 서버는 { status, message, data: { post: [...] } } 로 감싸서 주므로,
 * 화면에서 바로 쓰기 좋게 래퍼를 벗겨 post 배열만 반환한다.
 */
export async function getPosts(boardId: number): Promise<Post[]> {
  const { data } = await client.get<ApiResponse<PostListData>>(`/api/post/${boardId}`);
  return data.data.post;
}
