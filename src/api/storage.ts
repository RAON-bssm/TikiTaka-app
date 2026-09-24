import type { ApiResponse } from '@/types/api';
import type { PresignedUrlData } from '@/types/storage';
import client from './client';

/** S3 key → 표시용 presigned URL (유효 10분). */
export async function getViewUrl(key: string): Promise<string> {
  const { data } = await client.get<ApiResponse<PresignedUrlData>>('/api/storage/view-url', {
    params: { key },
  });
  return data.data.url;
}
