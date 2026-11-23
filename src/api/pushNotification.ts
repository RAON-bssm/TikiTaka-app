import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import * as SecureStore from 'expo-secure-store';
import { PermissionsAndroid, Platform } from 'react-native';

import type { EmptyResponse } from '@/types/api';
import type { PushType } from '@/types/pushNotification';
import client from './client';

const NOTIFICATION_PERMISSION_ASKED_KEY = 'notificationPermissionAsked';
const PUSH_TYPES: readonly string[] = ['DAILY_WAGE', 'TERRITORY_CAPTURED'] satisfies PushType[];

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
 * 앱이 앞에 있을 때 받은 FCM 메시지. 두 플랫폼 모두 `onMessage`로 들어온다.
 * Android는 이때 시스템 알림을 띄우지 않아(iOS는 firebase.json `messaging_ios_foreground_presentation_options`로 배너가 뜬다)
 * 앱 안에서 보여 줄 수 있게 제목·본문을 `text`로 넘긴다. 알림 표시 라이브러리(expo-notifications 등)는 FCM 수신 서비스가 겹쳐 쓰지 않는다.
 */
export function subscribeForegroundNotification(
  listener: (notice: { type?: PushType; text: string }) => void,
): () => void {
  return onMessage(getMessaging(), (message) => {
    const { title, body } = message.notification ?? {};
    listener({ type: toPushType(message), text: [title, body].filter(Boolean).join('\n') });
  });
}

/**
 * 이 기기의 FCM 토큰을 서버에 등록한다. 서버가 upsert라 여러 번 불러도 되고, 같은 기기에서 다른 계정으로 로그인하면
 * 토큰 주인이 새 계정으로 바뀐다. 서버는 60일 동안 등록되지 않은 토큰을 지우므로 실행마다 다시 보낸다.
 */
async function registerPushToken(token: string): Promise<void> {
  await client.put<EmptyResponse>('/api/push-tokens', { token, platform: Platform.OS });
}

// 해제(DELETE)가 진행 중인 등록(PUT)보다 먼저 서버에 닿으면, 로그아웃한 기기 토큰이 이전 계정에 다시 등록된다.
let pendingRegistration: Promise<void> = Promise.resolve();

function trackRegistration(registration: Promise<void>): Promise<void> {
  pendingRegistration = registration.catch(() => {});
  return registration;
}

export function registerCurrentPushToken(): Promise<void> {
  return trackRegistration(getToken(getMessaging()).then(registerPushToken));
}

// 해제는 로그아웃·탈퇴를 붙잡고 있으니 오래 기다리지 않는다. getToken은 자체 타임아웃 없이 FCM 서버를 기다릴 수 있다.
const UNREGISTER_TIMEOUT_MS = 3000;

/**
 * 로그아웃·탈퇴 API보다 먼저 부른다(access token이 살아 있어야 한다). 내 계정의 이 기기 토큰만 지운다.
 * 제한 시간을 넘기면 실패로 끝낸다. 남은 토큰은 다른 계정이 이 기기에서 로그인하면 주인이 바뀌고, 아니면 60일 뒤 서버가 지운다.
 */
export function unregisterPushToken(): Promise<void> {
  const unregister = (async () => {
    await pendingRegistration;
    const token = await getToken(getMessaging());
    await client.delete<EmptyResponse>('/api/push-tokens', { data: { token } });
  })();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('푸시 토큰 해제 시간 초과')), UNREGISTER_TIMEOUT_MS);
  });
  return Promise.race([unregister, timeout]).finally(() => clearTimeout(timer));
}

/** 로그인 상태인 동안 지금 토큰을 등록하고, FCM이 토큰을 바꾸면 다시 등록한다. 실패해도 다음 실행 때 다시 보내므로 무시한다. */
export function subscribePushTokenRegistration(): () => void {
  registerCurrentPushToken().catch(() => {});
  return onTokenRefresh(getMessaging(), (token) => {
    trackRegistration(registerPushToken(token)).catch(() => {});
  });
}
