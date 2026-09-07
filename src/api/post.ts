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

  // [DEBUG] 실제로 이미지가 로드·재인코딩됐는지 확인용. width/height가 0이 아니면 유효한 이미지 바이트가 만들어진 것.
  console.log('[upload] source uri:', uri);
  console.log('[upload] compressed:', result.uri, `${result.width}x${result.height}`);

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

export async function getPostDetail(postId: string): Promise<PostDetail> {
  const { data } = await client.get<ApiResponse<PostDetail>>(`/api/post/${postId}`);
  return data.data;
}

/**
 * 게시물 생성. 사진 파일을 함께 올려야 하므로 multipart/form-data로 전송한다.
 * post_image 파트에는 로컬 파일(uri/name/type)을 담는다.
 */
export async function createPost({ board_id, fileUri, content }: CreatePostRequest): Promise<void> {
  // 원본 대신 압축/리사이즈한 이미지를 업로드한다(413 방지).
  const compressedUri = await compressImageForUpload(fileUri);
  const fileName = compressedUri.split('/').pop() ?? `photo-${Date.now()}.jpg`;

  // 서버 DTO(CreatePostRequest: boardId, content, image)와 필드명이 정확히 일치해야
  // @ModelAttribute 바인딩이 된다. snake_case로 보내면 null 바인딩되어 400이 난다.
  const formData = new FormData();
  formData.append('boardId', String(board_id));
  formData.append('content', content);
  formData.append('image', {
    uri: compressedUri,
    name: fileName,
    type: 'image/jpeg',
  } as unknown as Blob);

  // Content-Type을 직접 'multipart/form-data'로 박으면 boundary가 빠져 서버가 파트를 파싱하지 못해 400이 난다.
  // undefined로 넘겨 axios 인스턴스 기본값(application/json)을 해제하면, RN 네트워킹이 boundary 포함 헤더를 자동 생성한다.
  // 서버는 생성된 게시물을 돌려주지 않는다(data: null). 반환값이 없으므로 post_id가 필요하면 목록을 다시 받아야 한다. (useUploadPost 참고)
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
