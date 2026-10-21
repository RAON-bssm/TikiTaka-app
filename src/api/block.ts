import type { ApiResponse, EmptyResponse } from '@/types/api';
import type { BlockedUserListData } from '@/types/block';
import client from './client';

/** 이미 차단한 유저도 200. 실패: 400 본인 차단 시도, 404 없거나 탈퇴한 유저. */
export async function blockUser(userId: string): Promise<void> {
  await client.post<EmptyResponse>(`/api/user/${userId}/block`);
}

/** 차단한 적 없는 유저도 200. 실패: 400 본인, 404 없거나 탈퇴한 유저. */
export async function unblockUser(userId: string): Promise<void> {
  await client.delete<EmptyResponse>(`/api/user/${userId}/block`);
}

export async function getBlockedUsers(): Promise<BlockedUserListData['blocked_users']> {
  const { data } = await client.get<ApiResponse<BlockedUserListData>>('/api/user/me/blocks');
  return data.data.blocked_users;
}
