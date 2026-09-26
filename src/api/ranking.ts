import type { ApiResponse } from '@/types/api';
import type { LocationRankingListData, UserRankingListData } from '@/types/ranking';
import client from './client';

export async function getLocationRanking(): Promise<LocationRankingListData> {
  const { data } = await client.get<ApiResponse<LocationRankingListData>>('/api/location/rank');
  return data.data;
}

export async function getUserRanking(): Promise<UserRankingListData> {
  const { data } = await client.get<ApiResponse<UserRankingListData>>('/api/users/rank');
  return data.data;
}
