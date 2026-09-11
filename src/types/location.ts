import type { ApiResponse } from './api';

/**
 * 동네(구/군) 한 건. `GET /api/location`
 *
 * 가입의 `main_location_id` 등에 넣는 값이 이 `location_id`다. 서버 DB의 PK라
 * **목록 순서를 id로 가정하면 안 된다.**
 *
 * `city_name`은 시/도(예: `'부산광역시'`)다. 이름이 겹치는 구/군(부산 북구 · 대구 북구)을
 * 가르는 축이기도 하므로, 동네를 보여줄 때 구/군 이름만 쓰면 모호해질 수 있다.
 */
export interface Location {
  location_id: number;
  city_name: string;
  location_name: string;
}

/** `GET /api/location` 응답 data. 인증 없이 호출 가능(가입 화면에서 토큰 발급 전에 쓴다). */
export interface LocationListData {
  locations: Location[];
}

export type LocationListResponse = ApiResponse<LocationListData>;
