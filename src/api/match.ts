import type { ApiResponse } from '@/types/api';
import type { Stage } from '@/types/match';
import client from './client';

export async function getMatchStage(): Promise<Stage> {
  const { data } = await client.get<ApiResponse<Stage>>('/api/match/stage');
  return data.data;
}
