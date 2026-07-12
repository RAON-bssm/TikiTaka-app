import type { ApiResponse } from '@/types/api';
import type { ViewUrlData } from '@/types/storage';
import client from './client';

/**
 * (표시용) 저장된 key로 이미지 조회 URL을 발급받는다.
 * GET /api/storage/view-url?key=... → data.url (유효 10분)
 */
export async function getViewUrl(key: string): Promise<string> {
  const { data } = await client.get<ApiResponse<ViewUrlData>>('/api/storage/view-url', {
    params: { key },
  });
  return data.data.url;
}
