import type { ApiResponse, DateTimeString } from './api';
import type { Equipment } from './equipment';

export interface LocationRanking {
  location_id: number;
  city_name: string;
  location_name: string;
  location_rank: number;
  location_score: number;
}

export interface LocationRankingListData {
  /** 갱신 시각이 아니라 응답 생성 시각(매번 now())이다. "몇 시 기준"으로 쓰면 안 된다. */
  updated_at: DateTimeString;
  location_ranking: LocationRanking[];
}

export type LocationRankingListResponse = ApiResponse<LocationRankingListData>;

/** `user_equipment`는 `GET /api/equipment/{userId}`와 같은 모양. 없는 슬롯은 키가 빠진다. */
export interface UserRanking {
  user_id: string;
  user_name: string;
  user_equipment?: Equipment;
  user_rank: number;
  user_score: number;
}

/**
 * `user_ranking`은 상위 100명까지. `my_ranking`은 이번 라운드 게시물이 없으면 키가 빠진다(미참여 ≠ 0점).
 * 아바타는 `user_equipment`에 같이 온다(행마다 따로 조회할 필요 없음).
 */
export interface UserRankingListData {
  updated_at: DateTimeString;
  user_ranking: UserRanking[];
  my_ranking?: UserRanking;
}

export type UserRankingListResponse = ApiResponse<UserRankingListData>;
