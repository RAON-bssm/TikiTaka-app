import type { ApiResponse } from '@/types/api';
import type {
  Board,
  BoardListData,
  CreatePostRequest,
  CreatePostData,
  DeletePostResponse,
  LikePostResponse,
  MyPost,
  MyPostListData,
  Post,
  PostDetail,
  PostListData,
  PostStatus,
  UpdatePostRequest,
  UpdatePostResponse,
} from '@/types/post';
import client from './client';
import { compressImageForUpload } from './uploadImage';

// 심사를 기다리지 않아도 사진 전송과 S3 업로드 시간은 남아, 느린 망에서는 기본 10초를 넘긴다.
const CREATE_POST_TIMEOUT_MS = 30 * 1000;

export async function getBoards(): Promise<Board[]> {
  const { data } = await client.get<ApiResponse<BoardListData>>(`/api/board`);
  return data.data.board;
}

export interface PostPage {
  posts: Post[];
  /** 다음 페이지가 있을 때만 있다(`size`·`cursor`로 요청했을 때 한정). */
  nextCursor?: string;
}

/**
 * 목록과 상세가 같은 `/api/post/{id}` 경로다. 서버가 숫자면 목록, UUID면 상세로 라우팅한다.
 * `size`·`cursor` 둘 다 생략하면 보드 전체 글이 한 번에 온다(옛 방식, 서버가 페이징 전면 적용되면 없어질 예정).
 * `size`는 1~50, `cursor`는 이전 응답의 `next_cursor`를 그대로 넘긴다.
 */
export async function getPosts(
  boardId: number,
  params?: { size?: number; cursor?: string },
): Promise<PostPage> {
  const { data } = await client.get<ApiResponse<PostListData>>(`/api/post/${boardId}`, {
    params,
  });
  return { posts: data.data.post, nextCursor: data.data.next_cursor };
}

export async function getMyPosts(): Promise<MyPost[]> {
  const { data } = await client.get<ApiResponse<MyPostListData>>('/api/user/me/posts');
  return data.data.post;
}

export async function getPostDetail(postId: string): Promise<PostDetail> {
  const { data } = await client.get<ApiResponse<PostDetail>>(`/api/post/${postId}`);
  return data.data;
}

export async function createPost({
  board_id,
  fileUri,
  content,
}: CreatePostRequest): Promise<{ postId: string; status: PostStatus }> {
  const compressedUri = await compressImageForUpload(fileUri);
  const fileName = compressedUri.split('/').pop() ?? `photo-${Date.now()}.jpg`;

  // 파트 이름은 서버 DTO(@ModelAttribute)와 정확히 같아야 한다. snake_case면 null 바인딩되어 400.
  const formData = new FormData();
  formData.append('boardId', String(board_id));
  formData.append('content', content);
  formData.append('image', {
    uri: compressedUri,
    name: fileName,
    type: 'image/jpeg',
  } as unknown as Blob);

  // Content-Type을 'multipart/form-data'로 박으면 boundary가 빠져 400이 난다.
  // undefined로 기본값(application/json)을 해제해 RN이 boundary 포함 헤더를 만들게 한다.
  const { data } = await client.post<ApiResponse<CreatePostData>>(`/api/post`, formData, {
    headers: { 'Content-Type': undefined },
    timeout: CREATE_POST_TIMEOUT_MS,
  });
  return { postId: data.data.post_id, status: data.data.status };
}

export async function updatePost(postId: string, req: UpdatePostRequest): Promise<void> {
  await client.patch<UpdatePostResponse>(`/api/post/patch/${postId}`, req);
}

export async function deletePost(postId: string): Promise<void> {
  await client.patch<DeletePostResponse>(`/api/post/delete/${postId}`);
}

export async function likePost(postId: string): Promise<void> {
  await client.post<LikePostResponse>(`/api/post/${postId}/like`);
}

export async function unlikePost(postId: string): Promise<void> {
  await client.delete<LikePostResponse>(`/api/post/${postId}/like`);
}
