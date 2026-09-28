import type { ApiResponse } from './api';
import type { UserLocation } from './location';

export interface UserInfo {
  user_id: string;
  user_name: string;
  /** 본진. 대표하는 동네이고, 본진에서 쓴 글만 동네 점수에 들어간다. */
  main_location: UserLocation;
  /** 지금 있는 동네. 글을 쓸 수 있는 게시판(`my_match`)이 이 기준으로 정해진다. */
  current_location: UserLocation;
  /** 본진 변경 예약. 다음 라운드 시작 직후 배치가 본진·현재 지역을 이 동네로 옮긴다. 없으면 키가 빠진다. */
  pending_location?: UserLocation;
  /** 현재 지역이 본진인지. */
  at_home: boolean;
  point: number;
}

export type UserInfoResponse = ApiResponse<UserInfo>;

/**
 * `/api/user/me`와 겹치지만 동네를 id 없이 이름만 주고, 이번 라운드 순위·점수가 붙는다.
 * 동네를 수정하는 화면이면 `/api/user/me`를 쓸 것. 본진 변경 예약·랭킹 행이 없으면 해당 키가 빠진다.
 */
export interface UserProfile {
  user_name: string;
  main_location_city_name: string;
  main_location_name: string;
  current_location_city_name: string;
  current_location_name: string;
  pending_location_city_name?: string;
  pending_location_name?: string;
  at_home: boolean;
  user_rank?: number;
  user_score?: number;
  point: number;
}

export type UserProfileResponse = ApiResponse<UserProfile>;

/** 부분 수정 — 넘기지 않은 필드는 유지된다. 닉네임 중복이면 409. */
export interface UpdateProfileRequest {
  user_name?: string;
  /** 즉시 바뀌지 않고 본진 변경 예약(`POST /api/user/location-change`)과 같게 처리된다. */
  main_location_id?: number;
}

/**
 * 본진 변경 예약과 현재 지역 이동이 같은 바디를 쓴다.
 * 400 사유(미선택·없는 동네·이미 본진인 동네)는 `message`로만 구분된다.
 */
export interface LocationChangeRequest {
  location_id: number;
}
