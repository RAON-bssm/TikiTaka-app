import type { ApiResponse, EmptyResponse } from '@/types/api';
import type {
  LocationSwapResponse,
  SubLocationRequest,
  SubLocationResponse,
  UpdateProfileRequest,
  UserInfo,
  UserProfile,
} from '@/types/user';
import client from './client';

/**
 * 내 정보 조회. 동네를 **id까지** 주므로 동네를 수정하는 화면은 이쪽을 쓴다.
 *
 * `sub_location`은 설정 전이면 키 자체가 내려오지 않는다.
 * 지역 스위칭 예약 여부(`pending_location_swap`)를 볼 수 있는 유일한 API다.
 */
export async function getMyInfo(): Promise<UserInfo> {
  const { data } = await client.get<ApiResponse<UserInfo>>('/api/user/me');
  return data.data;
}

/**
 * 프로필 조회. 표시용이다.
 *
 * `/api/user/me`와 겹치지만 동네를 **이름만** 주고(id 없음) 대신 이번 라운드
 * 순위·점수가 붙는다. 그래서 프로필을 보여줄 때는 이쪽, 동네를 고칠 때는 `getMyInfo`.
 * 서브 동네 미설정·랭킹 행 없음이면 해당 키가 생략된다.
 */
export async function getMyProfile(): Promise<UserProfile> {
  const { data } = await client.get<ApiResponse<UserProfile>>('/api/users/profile');
  return data.data;
}

/**
 * 프로필 수정. **부분 수정이라 넘기지 않은 필드는 유지된다.**
 *
 * 닉네임이 중복이면 409. 동네도 함께 고칠 수 있지만, 서브 동네만 바꾸는 경우에는
 * 400 사유가 더 분명한 `setSubLocation`을 쓴다.
 */
export async function updateProfile(req: UpdateProfileRequest): Promise<void> {
  await client.patch<EmptyResponse>('/api/users/profile', req);
}

/**
 * 서브 동네 설정.
 *
 * 실패는 전부 400으로 오고 사유(미선택·없는 동네·메인과 동일)가 `message`로만 구분되므로,
 * 호출부는 상태코드로 분기하지 말고 서버 문구를 그대로 보여준다.
 */
export async function setSubLocation(locationId: number): Promise<void> {
  const req: SubLocationRequest = { location_id: locationId };
  await client.put<SubLocationResponse>('/api/user/sub-location', req);
}

/**
 * 지역 스위칭 예약. **즉시 바뀌지 않는다.**
 *
 * 실제 메인↔서브 교환은 다음 라운드 시작 직후 배치가 처리하므로, 성공해도 화면의 동네는
 * 그대로다. 예약됐다는 사실은 `getMyInfo`의 `pending_location_swap`으로만 확인된다.
 * 서브 동네 미설정 상태로 예약하면 400.
 */
export async function requestLocationSwap(): Promise<void> {
  await client.post<LocationSwapResponse>('/api/user/location-swap');
}

/** 지역 스위칭 예약 취소. 다음 라운드가 시작되기 전까지만 의미가 있다. */
export async function cancelLocationSwap(): Promise<void> {
  await client.delete<LocationSwapResponse>('/api/user/location-swap');
}
