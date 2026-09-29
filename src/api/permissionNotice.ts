import * as SecureStore from 'expo-secure-store';

const PERMISSION_NOTICE_KEY = 'permissionNoticeSeen';

// 계정이 아니라 기기(설치) 단위 안내라 로그아웃 때 지우지 않는다.
export async function hasSeenPermissionNotice(): Promise<boolean> {
  return (await SecureStore.getItemAsync(PERMISSION_NOTICE_KEY)) === 'true';
}

export async function markPermissionNoticeSeen(): Promise<void> {
  await SecureStore.setItemAsync(PERMISSION_NOTICE_KEY, 'true');
}
