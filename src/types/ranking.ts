import type { ApiResponse, DateTimeString } from './api';

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

export interface UserRanking {
  user_id: string;
  user_name: string;
  user_rank: number;
  user_score: number;
}

/**
 * `user_ranking`은 상위 100명까지. `my_ranking`은 이번 라운드 게시물이 없으면 키가 빠진다(미참여 ≠ 0점).
 * 남의 착용 정보를 주는 API가 없어 아바타 정보는 없다.
 */
export interface UserRankingListData {
  updated_at: DateTimeString;
  user_ranking: UserRanking[];
  my_ranking?: UserRanking;
}

export type UserRankingListResponse = ApiResponse<UserRankingListData>;
