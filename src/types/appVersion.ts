export type AppPlatform = 'ios' | 'android';

export type AppUpdateType = 'NONE' | 'OPTIONAL' | 'FORCE';

export interface AppVersionParams {
  /** 서버는 대소문자를 무시한다. 누락·오류면 400 `지원하지 않는 플랫폼입니다`. */
  platform: AppPlatform;
  /** `x.y.z`. 누락·형식 오류면 400 `앱 버전 형식이 올바르지 않습니다`(플랫폼 에러가 먼저 나간다). */
  current_version: string;
}

/**
 * `GET /api/app/version`. 로그인 전에도 부를 수 있다. 버전 비교는 서버가 끝내고 `update_type`만 보면 된다.
 * - `latest_version`: 해당 플랫폼 설정이 없으면(기능 꺼짐) 키가 빠진다.
 * - `min_supported_version`: 값이 없거나 형식 오류거나 latest보다 크면 키가 빠진다.
 * - `store_url`: `update_type`이 `NONE`이면 키가 빠진다.
 */
export interface AppVersionData {
  update_type: AppUpdateType;
  current_version: string;
  latest_version?: string;
  min_supported_version?: string;
  store_url?: string;
}
