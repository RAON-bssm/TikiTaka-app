import type { ApiResponse } from './api';

/** `location_id`는 DB PK라 목록 순서로 가정하면 안 된다. `city_name`은 시/도. */
export interface Location {
  location_id: number;
  city_name: string;
  location_name: string;
}

/** `/api/user/me`의 동네. `Location`과 같지만 시/도 키가 `location_city_name`이다. */
export interface UserLocation {
  location_id: number;
  location_city_name: string;
  location_name: string;
}

export interface LocationListData {
  locations: Location[];
}

export type LocationListResponse = ApiResponse<LocationListData>;
