import type { ApiResponse } from '@/types/api';
import type { LocationRankingListData, UserRankingListData } from '@/types/ranking';
import client from './client';

/** 동네 랭킹 조회. `GET /api/location/rank` (인증 불필요) */
export async function getLocationRanking(): Promise<LocationRankingListData> {
  const { data } = await client.get<ApiResponse<LocationRankingListData>>('/api/location/rank');
  return data.data;
}

/**
 * 개인 랭킹 조회. `GET /api/users/rank`
 *
 * `my_ranking`은 이번 라운드에 게시물이 없으면 응답에서 키 자체가 빠진다(미참여 ≠ 0점).
 */
export async function getUserRanking(): Promise<UserRankingListData> {
  const { data } = await client.get<ApiResponse<UserRankingListData>>('/api/users/rank');
  return data.data;
}
