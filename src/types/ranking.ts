import type { ApiResponse, DateTimeString } from './api';

/** 동네 랭킹 한 행. `GET /api/location/rank` (인증 불필요) */
export interface LocationRanking {
  location_id: number;
  location_name: string;
  location_rank: number;
  location_score: number;
}

/**
 * `GET /api/location/rank` 응답 data.
 *
 * `updated_at`은 갱신 시각이 아니라 **응답을 만든 시각**이다(매번 now()). "몇 시 기준 랭킹"으로 쓰면 안 된다.
 */
export interface LocationRankingListData {
  updated_at: DateTimeString;
  location_ranking: LocationRanking[];
}

export type LocationRankingListResponse = ApiResponse<LocationRankingListData>;

/** 개인 랭킹 한 행. `GET /api/users/rank` */
export interface UserRanking {
  user_id: string;
  user_name: string;
  user_rank: number;
  user_score: number;
}

/**
 * `GET /api/users/rank` 응답 data.
 *
 * `user_ranking`은 **상위 100명**까지다. `my_ranking`은 순위와 무관하게 따로 붙지만,
 * 이번 라운드에 게시물이 없으면 **키 자체가 내려오지 않는다.** (미참여 ≠ 0점)
 *
 * 아바타 정보는 없다 — 서버에 남의 착용 정보를 주는 API가 없다.
 */
export interface UserRankingListData {
  updated_at: DateTimeString;
  user_ranking: UserRanking[];
  my_ranking?: UserRanking;
}

export type UserRankingListResponse = ApiResponse<UserRankingListData>;
