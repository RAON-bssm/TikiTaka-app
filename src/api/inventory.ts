import type { ApiResponse } from '@/types/api';
import type { InventoryListData, InventoryItem } from '@/types/inventory';
import client from './client';

export async function getInventory(): Promise<InventoryItem[]> {
  const { data } = await client.get<ApiResponse<InventoryListData>>('/api/inventory');
  return data.data.product;
}
