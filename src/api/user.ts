import type { ApiResponse, EmptyResponse } from '@/types/api';
import type {
  LocationSwapResponse,
  SubLocationRequest,
  SubLocationResponse,
  UpdateProfileRequest,
  UserInfo,
  UserProfile,
} from '@/types/user';
import client from './client';

export async function getMyInfo(): Promise<UserInfo> {
  const { data } = await client.get<ApiResponse<UserInfo>>('/api/user/me');
  return data.data;
}

export async function getMyProfile(): Promise<UserProfile> {
  const { data } = await client.get<ApiResponse<UserProfile>>('/api/users/profile');
  return data.data;
}

export async function updateProfile(req: UpdateProfileRequest): Promise<void> {
  await client.patch<EmptyResponse>('/api/users/profile', req);
}

export async function setSubLocation(locationId: number): Promise<void> {
  const req: SubLocationRequest = { location_id: locationId };
  await client.put<SubLocationResponse>('/api/user/sub-location', req);
}

export async function requestLocationSwap(): Promise<void> {
  await client.post<LocationSwapResponse>('/api/user/location-swap');
}

export async function cancelLocationSwap(): Promise<void> {
  await client.delete<LocationSwapResponse>('/api/user/location-swap');
}
