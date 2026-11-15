import type { ApiResponse } from '@/types/api';
import type { PresignedUrlData } from '@/types/storage';
import client from './client';

/** presigned URL 유효시간(10분)보다 짧게 잡아, 이보다 오래된 URL은 만료됐다고 보고 새로 받는다. */
export const VIEW_URL_SAFE_AGE = 9 * 60 * 1000;

/** S3 key → 표시용 presigned URL (유효 10분). */
export async function getViewUrl(key: string): Promise<string> {
  const { data } = await client.get<ApiResponse<PresignedUrlData>>('/api/storage/view-url', {
    params: { key },
  });
  return data.data.url;
}
