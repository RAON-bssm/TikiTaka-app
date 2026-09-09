import type { ApiResponse } from '@/types/api';
import type { Location, LocationListData } from '@/types/location';
import client from './client';

/**
 * 동네(구/군) 목록 조회.
 *
 * 가입·프로필의 `main_location_id`/`sub_location_id`에 넣을 실제 `location_id`를 얻는
 * 유일한 창구다. 서버 DB의 PK를 그대로 내려주므로 **목록 순서를 id로 가정하면 안 된다.**
 * 인증 없이 호출 가능해, 토큰 발급 전인 회원가입 화면에서도 쓸 수 있다.
 */
export async function getLocations(): Promise<Location[]> {
  const { data } = await client.get<ApiResponse<LocationListData>>('/api/location');
  return data.data.locations;
}
