import type { ApiResponse, EmptyResponse } from '@/types/api';
import type {
  LocationChangeRequest,
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

/** 예약만 한다. 이미 예약이 있으면 새 동네로 덮어쓴다. */
export async function reserveLocationChange(locationId: number): Promise<void> {
  const req: LocationChangeRequest = { location_id: locationId };
  await client.post<EmptyResponse>('/api/user/location-change', req);
}

/** 예약이 없어도 성공한다. */
export async function cancelLocationChange(): Promise<void> {
  await client.delete<EmptyResponse>('/api/user/location-change');
}

/** 라운드 도중에도 즉시 반영된다. */
export async function moveCurrentLocation(locationId: number): Promise<void> {
  const req: LocationChangeRequest = { location_id: locationId };
  await client.patch<EmptyResponse>('/api/user/current-location', req);
}
