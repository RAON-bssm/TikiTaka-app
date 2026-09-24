import type { ApiResponse } from '@/types/api';
import type { MatchResultListData, Stage } from '@/types/match';
import client from './client';

export async function getMatchStage(): Promise<Stage> {
  const { data } = await client.get<ApiResponse<Stage>>('/api/match/stage');
  return data.data;
}

/** 직전 종료 라운드의 결과. 없으면 빈 배열. */
export async function getMatchResult(): Promise<MatchResultListData> {
  const { data } = await client.get<ApiResponse<MatchResultListData>>('/api/match/result');
  return data.data;
}
