import type { ApiResponse, DateTimeString } from './api';

export interface BlockedUser {
  user_id: string;
  user_name: string;
  blocked_at: DateTimeString;
}

export interface BlockedUserListData {
  blocked_users: BlockedUser[];
}

export type BlockedUserListResponse = ApiResponse<BlockedUserListData>;
