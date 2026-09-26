import type { ApiResponse, EmptyResponse } from './api';
import type { UserLocation } from './location';

export interface UserInfo {
  user_id: string;
  user_name: string;
  main_location: UserLocation;
  /** 설정 전이면 키가 빠진다. */
  sub_location?: UserLocation;
  /** true면 다음 라운드 시작 직후 메인/서브 동네가 교환된다. */
  pending_location_swap: boolean;
  point: number;
}

export type UserInfoResponse = ApiResponse<UserInfo>;

/**
 * `/api/user/me`와 겹치지만 동네를 id 없이 이름만 주고, 이번 라운드 순위·점수가 붙는다.
 * 동네를 수정하는 화면이면 `/api/user/me`를 쓸 것. 서브 동네·랭킹 행이 없으면 해당 키가 빠진다.
 */
export interface UserProfile {
  user_name: string;
  main_location_city_name: string;
  main_location_name: string;
  sub_location_city_name?: string;
  sub_location_name?: string;
  user_rank?: number;
  user_score?: number;
  point: number;
}

export type UserProfileResponse = ApiResponse<UserProfile>;

/** 부분 수정 — 넘기지 않은 필드는 유지된다. 닉네임 중복이면 409. */
export interface UpdateProfileRequest {
  user_name?: string;
  main_location_id?: number;
  sub_location_id?: number;
}

export interface SubLocationRequest {
  location_id: number;
}

/** 400 사유(미선택·없는 동네·메인과 동일)가 `message`로만 구분된다. */
export type SubLocationResponse = EmptyResponse;

/**
 * 즉시 바뀌지 않는다 — 다음 라운드 시작 직후 배치가 교환하고, 예약 상태는 `pending_location_swap`으로 본다.
 * 서브 동네 미설정 상태로 예약하면 400.
 */
export type LocationSwapResponse = EmptyResponse;
