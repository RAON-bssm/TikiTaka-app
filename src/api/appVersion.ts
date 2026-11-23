import type { ApiResponse } from '@/types/api';
import type { AppVersionData, AppVersionParams } from '@/types/appVersion';
import client from './client';

export async function getAppVersion(params: AppVersionParams): Promise<AppVersionData> {
  const { data } = await client.get<ApiResponse<AppVersionData>>('/api/app/version', { params });
  return data.data;
}
