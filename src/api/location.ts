import type { ApiResponse } from '@/types/api';
import type { Location, LocationListData } from '@/types/location';
import client from './client';

export async function getLocations(): Promise<Location[]> {
  const { data } = await client.get<ApiResponse<LocationListData>>('/api/location');
  return data.data.locations;
}
