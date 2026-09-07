import type { ApiResponse, EmptyResponse } from './api';
import type { Location } from './location';

/**
 * 내 정보. `GET /api/user/me`
 *
 * `sub_location`은 설정 전이면 **키 자체가 내려오지 않는다.**
 */
export interface UserInfo {
  user_name: string;
  main_location: Location;
  sub_location?: Location;
  /** true면 다음 라운드 시작 직후 메인/서브 동네가 교환된다. */
  pending_location_swap: boolean;
  point: number;
}

export type UserInfoResponse = ApiResponse<UserInfo>;

/**
 * 프로필. `GET /api/users/profile`
 *
 * `/api/user/me`와 겹치지만 **동네를 id 없이 이름만** 주고, 대신 이번 라운드 순위·점수가 붙는다.
 * 동네를 수정하는 화면이면 `/api/user/me`(id 포함)를 쓸 것.
 * 서브 동네 미설정·랭킹 행 없음이면 해당 키가 생략된다.
 */
export interface UserProfile {
  user_name: string;
  main_location_name: string;
  sub_location_name?: string;
  user_rank?: number;
  user_score?: number;
  point: number;
}

export type UserProfileResponse = ApiResponse<UserProfile>;

/**
 * 프로필 수정 요청 body. `PATCH /api/users/profile`
 *
 * 부분 수정이다 — 넘기지 않은 필드는 유지된다. 닉네임 중복이면 409.
 */
export interface UpdateProfileRequest {
  user_name?: string;
  main_location_id?: number;
  sub_location_id?: number;
}

/** 서브 동네 설정 요청 body. `PUT /api/user/sub-location` */
export interface SubLocationRequest {
  location_id: number;
}

/** 서브 동네 설정 응답. 400 사유(미선택·없는 동네·메인과 동일)가 `message`로만 구분된다. */
export type SubLocationResponse = EmptyResponse;

/**
 * 지역 스위칭 예약·취소 응답. `POST`·`DELETE /api/user/location-swap` (body 없음)
 *
 * **즉시 바뀌지 않는다** — 실제 교환은 다음 라운드 시작 직후 배치가 처리하고,
 * 예약 상태는 `/api/user/me`의 `pending_location_swap`으로 본다.
 * 서브 동네 미설정 상태로 예약하면 400.
 */
export type LocationSwapResponse = EmptyResponse;
