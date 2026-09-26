import type { ApiResponse } from './api';

/**
 * view-url(유효 10분)과 upload-url이 같은 형태를 쓴다.
 * `key`는 쿼리스트링을 뗀 마지막 경로 조각으로, 게시물에 저장하는 식별자다.
 */
export interface PresignedUrlData {
  url: string;
  key: string;
}

export type PresignedUrlResponse = ApiResponse<PresignedUrlData>;
