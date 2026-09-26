import type { ApiResponse, EmptyResponse } from '@/types/api';
import type { EquipRequest, Equipment } from '@/types/equipment';
import client from './client';

export async function getEquipment(): Promise<Equipment> {
  const { data } = await client.get<ApiResponse<Equipment>>('/api/equipment');
  return data.data;
}

export async function equipItems(req: EquipRequest): Promise<void> {
  await client.patch<EmptyResponse>('/api/equipment', req);
}
