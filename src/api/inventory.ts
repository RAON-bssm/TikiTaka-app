import type { ApiResponse } from '@/types/api';
import type { InventoryListData, InventoryItem } from '@/types/inventory';
import client from './client';

/** 보유 아이템 목록. `GET /api/inventory` */
export async function getInventory(): Promise<InventoryItem[]> {
  const { data } = await client.get<ApiResponse<InventoryListData>>('/api/inventory');
  return data.data.product;
}
