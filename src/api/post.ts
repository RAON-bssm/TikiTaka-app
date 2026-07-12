import type { ApiResponse } from '@/types/api';
import type {
  Board,
  BoardListData,
  CreatePostRequest,
  Post,
  PostListData,
  UpdatePostRequest,
} from '@/types/post';
import client from './client';

export async function getBoards(): Promise<Board[]> {
  const { data } = await client.get<ApiResponse<BoardListData>>(`/api/board`);
  return data.data.board;
}

export async function getPosts(boardId: number): Promise<Post[]> {
  const { data } = await client.get<ApiResponse<PostListData>>(`/api/post/${boardId}`);
  return data.data.post;
}

export async function getPostDetail(postId: string): Promise<Post> {
  const { data } = await client.get<ApiResponse<Post>>(`/api/post/${postId}`);
  return data.data;
}

export async function createPost(req: CreatePostRequest) {
  const { data } = await client.post<ApiResponse<Post>>(`/api/post`, req);
  return data.data;
}

export async function updatePost(postId: string, req: UpdatePostRequest) {
  const { data } = await client.patch(`/api/post/patch/${postId}`, req);
  return data.data;
}

export async function deletePost(postId: string) {
  const { data } = await client.patch(`/api/post/delete/${postId}`);
  return data.data;
}
