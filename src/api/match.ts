import type { ApiResponse } from '@/types/api';
import type { MatchResultListData, Stage } from '@/types/match';
import client from './client';

/** 현재 시즌·라운드 조회. `GET /api/match/stage` */
export async function getMatchStage(): Promise<Stage> {
  const { data } = await client.get<ApiResponse<Stage>>('/api/match/stage');
  return data.data;
}

/**
 * 직전 라운드 경기 결과 조회. `GET /api/match/result`
 *
 * 직전에 종료된 라운드가 없으면 빈 배열이 내려온다.
 */
export async function getMatchResult(): Promise<MatchResultListData> {
  const { data } = await client.get<ApiResponse<MatchResultListData>>('/api/match/result');
  return data.data;
}
