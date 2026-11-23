import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  requestPermission,
} from '@react-native-firebase/messaging';
import * as SecureStore from 'expo-secure-store';
import { PermissionsAndroid, Platform } from 'react-native';

import type { PushType } from '@/types/pushNotification';

const NOTIFICATION_PERMISSION_ASKED_KEY = 'notificationPermissionAsked';
const PUSH_TYPES: readonly string[] = ['WAGE'] satisfies PushType[];

// 접근권한 안내를 이미 본 기존 사용자에게 알림 권한만 한 번 더 묻기 위한 표시다.
// 계정이 아니라 기기 단위라 로그아웃 때 지우지 않는다.
export async function hasAskedNotificationPermission(): Promise<boolean> {
  return (await SecureStore.getItemAsync(NOTIFICATION_PERMISSION_ASKED_KEY)) === 'true';
}

export async function markNotificationPermissionAsked(): Promise<void> {
  await SecureStore.setItemAsync(NOTIFICATION_PERMISSION_ASKED_KEY, 'true');
}

/** 개발용: 첫 실행 흐름을 다시 확인할 때만 쓴다. */
export async function resetNotificationPermissionAsked(): Promise<void> {
  await SecureStore.deleteItemAsync(NOTIFICATION_PERMISSION_ASKED_KEY);
}

/**
 * Android에서 RNFirebase `requestPermission`은 묻지 않고 허용을 돌려줘서, 13(API 33) 이상은
 * `POST_NOTIFICATIONS`를 직접 요청한다. 12 이하는 런타임 권한이 없어 기본으로 켜져 있다.
 * iOS용 `requestPermission`은 deprecated지만, expo-notifications를 함께 넣으면 Android FCM 수신 서비스가
 * 둘이 되어 충돌하므로 이것을 쓴다.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version < 33) return true;
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  const status = await requestPermission(getMessaging());
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

// RNFirebase가 `RemoteMessage` 타입을 export하지 않아 쓰는 필드만 적는다.
type OpenedMessage = {
  data?: Record<string, unknown>;
  notification?: { title?: string; body?: string };
} | null;

function toPushType(message: OpenedMessage): PushType | undefined {
  const type = message?.data?.type;
  return typeof type === 'string' && PUSH_TYPES.includes(type) ? (type as PushType) : undefined;
}

// 앱이 꺼진 상태에서 알림으로 열렸을 때의 메시지는 실행당 한 번만 처리한다.
// 로그아웃 후 다시 로그인해 구독하는 쪽이 다시 마운트돼도 같은 팝업이 또 뜨지 않게 한다.
let isInitialNotificationHandled = false;

/** 알림을 눌러 앱에 들어오면(꺼진 상태·백그라운드 모두) 그 알림의 종류를 넘긴다. 구독 해제 함수를 돌려준다. */
export function subscribeNotificationOpen(listener: (type: PushType) => void): () => void {
  const messaging = getMessaging();
  const handle = (message: OpenedMessage) => {
    const type = toPushType(message);
    if (type) listener(type);
  };

  if (!isInitialNotificationHandled) {
    isInitialNotificationHandled = true;
    getInitialNotification(messaging)
      .then(handle)
      .catch(() => {});
  }
  return onNotificationOpenedApp(messaging, handle);
}

/**
 * Android는 앱이 앞에 있을 때 받은 FCM 알림을 시스템에 띄우지 않고 `onMessage`로만 넘긴다
 * (iOS는 firebase.json `messaging_ios_foreground_presentation_options`로 배너가 뜬다).
 * 알림 표시 라이브러리(expo-notifications 등)는 FCM 수신 서비스가 겹쳐 쓰지 않으므로, 제목·본문을 넘겨 앱 안에서 보여 준다.
 */
export function subscribeForegroundNotification(
  listener: (notice: { type?: PushType; text: string }) => void,
): () => void {
  if (Platform.OS !== 'android') return () => {};
  return onMessage(getMessaging(), (message) => {
    const { title, body } = message.notification ?? {};
    const text = [title, body].filter(Boolean).join('\n');
    if (text) listener({ type: toPushType(message), text });
  });
}
