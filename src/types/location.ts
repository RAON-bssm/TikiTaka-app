import type { ApiResponse } from './api';

/**
 * 동네(구/군) 한 건. `GET /api/location`
 *
 * 가입의 `main_location_id` 등에 넣는 값이 이 `location_id`다. 서버 DB의 PK라
 * **목록 순서를 id로 가정하면 안 된다.**
 *
 * `city_name`은 시/도(예: `'부산광역시'`)다.
 */
export interface Location {
  location_id: number;
  city_name: string;
  location_name: string;
}

/**
 * `/api/user/me`의 `main_location`·`sub_location`.
 *
 * 담긴 값은 `Location`과 같지만 **시/도 키 이름이 `location_city_name`으로 다르다.**
 * 서버 DTO가 엔드포인트마다 따로 정의돼 있어, 두 타입을 합칠 수 없다.
 */
export interface UserLocation {
  location_id: number;
  location_city_name: string;
  location_name: string;
}

/** `GET /api/location` 응답 data. 인증 없이 호출 가능(가입 화면에서 토큰 발급 전에 쓴다). */
export interface LocationListData {
  locations: Location[];
}

export type LocationListResponse = ApiResponse<LocationListData>;
