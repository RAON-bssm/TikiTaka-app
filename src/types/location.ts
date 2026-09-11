import type { ApiResponse } from './api';

/**
 * 동네(구/군) 한 건. `GET /api/location`
 *
 * 가입의 `main_location_id` 등에 넣는 값이 이 `location_id`다. 서버 DB의 PK라
 * **목록 순서를 id로 가정하면 안 된다.**
 *
 * `city_name`은 시/도(예: `'부산광역시'`)다. **목록에만 붙는다** — `/api/user/me`가 주는
 * 메인·서브 동네는 시/도 없이 `LocationSummary` 모양으로 온다.
 */
export interface Location extends LocationSummary {
  city_name: string;
}

/** 시/도가 빠진 동네. `/api/user/me`의 `main_location`·`sub_location`이 이 모양이다. */
export interface LocationSummary {
  location_id: number;
  location_name: string;
}

/** `GET /api/location` 응답 data. 인증 없이 호출 가능(가입 화면에서 토큰 발급 전에 쓴다). */
export interface LocationListData {
  locations: Location[];
}

export type LocationListResponse = ApiResponse<LocationListData>;
