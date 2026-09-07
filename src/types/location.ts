import type { ApiResponse } from './api';

/**
 * 동네(구/군) 한 건. `GET /api/location`
 *
 * 가입의 `main_location_id` 등에 넣는 값이 이 `location_id`다. 서버 DB의 PK라
 * **목록 순서를 id로 가정하면 안 된다.**
 */
export interface Location {
  location_id: number;
  location_name: string;
}

/** `GET /api/location` 응답 data. 인증 없이 호출 가능(가입 화면에서 토큰 발급 전에 쓴다). */
export interface LocationListData {
  locations: Location[];
}

export type LocationListResponse = ApiResponse<LocationListData>;
