import type { ApiResponse } from './api';

/**
 * S3 presigned URL 응답. view-url(조회, 유효 10분)과 upload-url(업로드 PUT)이 같은 형태를 쓴다.
 *
 * `key`는 쿼리스트링을 뗀 마지막 경로 조각으로, 업로드 후 게시물에 저장할 식별자다.
 */
export interface PresignedUrlData {
  url: string;
  key: string;
}

export type PresignedUrlResponse = ApiResponse<PresignedUrlData>;
