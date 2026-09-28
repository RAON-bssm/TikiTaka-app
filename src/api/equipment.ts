import type { ApiResponse, EmptyResponse } from '@/types/api';
import type { EquipRequest, Equipment } from '@/types/equipment';
import client from './client';

export async function getEquipment(): Promise<Equipment> {
  const { data } = await client.get<ApiResponse<Equipment>>('/api/equipment');
  return data.data;
}

/** 본인 여부와 무관하게 조회된다. 없는 user_id는 404가 아니라 500이다. */
export async function getUserEquipment(userId: string): Promise<Equipment> {
  const { data } = await client.get<ApiResponse<Equipment>>(`/api/equipment/${userId}`);
  return data.data;
}

export async function equipItems(req: EquipRequest): Promise<void> {
  await client.patch<EmptyResponse>('/api/equipment', req);
}
