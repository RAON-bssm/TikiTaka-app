import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

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

// 업로드 전 이미지 압축 설정: 원본 카메라 사진은 수 MB에 달해 서버가 413(Payload Too Large)로
// 거부할 수 있으므로, 가로 폭을 제한하고 JPEG 품질을 낮춰 용량을 크게 줄인다.
const UPLOAD_IMAGE_MAX_WIDTH = 1440;
const UPLOAD_IMAGE_COMPRESS = 0.7;

/**
 * 업로드용으로 이미지를 리사이즈/압축한 새 파일 uri를 반환한다.
 * 원본보다 가로가 크면 축소하고(비율 유지), JPEG로 재인코딩한다.
 */
async function compressImageForUpload(uri: string): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: UPLOAD_IMAGE_MAX_WIDTH });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: UPLOAD_IMAGE_COMPRESS,
    format: SaveFormat.JPEG,
  });

  // 사용이 끝난 네이티브 객체는 메모리 해제
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

export async function getPostDetail(postId: string): Promise<Post> {
  const { data } = await client.get<ApiResponse<Post>>(`/api/post/${postId}`);
  return data.data;
}

/**
 * 게시물 생성. 사진 파일을 함께 올려야 하므로 multipart/form-data로 전송한다.
 * post_image 파트에는 로컬 파일(uri/name/type)을 담는다.
 */
export async function createPost({ board_id, fileUri, content }: CreatePostRequest) {
  // 원본 대신 압축/리사이즈한 이미지를 업로드한다(413 방지).
  const compressedUri = await compressImageForUpload(fileUri);
  const fileName = compressedUri.split('/').pop() ?? `photo-${Date.now()}.jpg`;

  const formData = new FormData();
  formData.append('board_id', String(board_id));
  formData.append('content', content);
  formData.append('post_image', {
    uri: compressedUri,
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
