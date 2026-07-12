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

/**
 * 게시물 생성. 사진 파일을 함께 올려야 하므로 multipart/form-data로 전송한다.
 * post_image 파트에는 로컬 파일(uri/name/type)을 담는다.
 */
export async function createPost({ board_id, fileUri, content }: CreatePostRequest) {
  const fileName = fileUri.split('/').pop() ?? `photo-${Date.now()}.jpg`;

  const formData = new FormData();
  formData.append('board_id', String(board_id));
  formData.append('content', content);
  formData.append('post_image', {
    uri: fileUri,
    name: fileName,
    type: 'image/jpeg',
  } as unknown as Blob);

  const { data } = await client.post<ApiResponse<Post>>(`/api/post`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
