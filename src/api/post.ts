import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { ApiResponse } from '@/types/api';
import type {
  Board,
  BoardListData,
  CreatePostRequest,
  CreatePostResponse,
  DeletePostResponse,
  Post,
  PostDetail,
  PostListData,
  UpdatePostRequest,
  UpdatePostResponse,
} from '@/types/post';
import client from './client';

// 원본 카메라 사진(수 MB)은 서버가 413으로 거부할 수 있어 축소·재압축해서 올린다.
const UPLOAD_IMAGE_MAX_WIDTH = 1440;
const UPLOAD_IMAGE_COMPRESS = 0.7;

async function compressImageForUpload(uri: string): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: UPLOAD_IMAGE_MAX_WIDTH });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: UPLOAD_IMAGE_COMPRESS,
    format: SaveFormat.JPEG,
  });

  // [DEBUG] width/height가 0이 아니면 유효한 이미지로 재인코딩된 것.
  console.log('[upload] source uri:', uri);
  console.log('[upload] compressed:', result.uri, `${result.width}x${result.height}`);

  context.release();
  image.release();

  return result.uri;
}

export async function getBoards(): Promise<Board[]> {
  const { data } = await client.get<ApiResponse<BoardListData>>(`/api/board`);
  return data.data.board;
}

export async function getPosts(boardId: number): Promise<Post[]> {
  const { data } = await client.get<ApiResponse<PostListData>>(`/api/post/${boardId}`);
  return data.data.post;
}

export async function getPostDetail(postId: string): Promise<PostDetail> {
  const { data } = await client.get<ApiResponse<PostDetail>>(`/api/post/${postId}`);
  return data.data;
}

/** 서버가 post_id를 돌려주지 않으므로, 필요하면 목록을 다시 받아야 한다. */
export async function createPost({ board_id, fileUri, content }: CreatePostRequest): Promise<void> {
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
  await client.post<CreatePostResponse>(`/api/post`, formData, {
    headers: { 'Content-Type': undefined },
  });
}

export async function updatePost(postId: string, req: UpdatePostRequest): Promise<void> {
  await client.patch<UpdatePostResponse>(`/api/post/patch/${postId}`, req);
}

export async function deletePost(postId: string): Promise<void> {
  await client.patch<DeletePostResponse>(`/api/post/delete/${postId}`);
}
