import { getAnalytics, setUserId } from '@react-native-firebase/analytics';

import type { Provider } from '@/types/auth';

/**
 * GA4로 보내는 이벤트와 파라미터. 이름은 40자, 문자열 값은 100자까지다.
 * 닉네임·글 내용·신고 상세처럼 사람을 알아볼 수 있는 값은 넣지 않는다.
 * `login`·`sign_up`은 GA 권장 이벤트라 기본 리포트에 바로 잡힌다.
 */
interface AnalyticsEvents {
  login: { method: Lowercase<Provider> };
  sign_up: { method: Lowercase<Provider> | 'unknown' };
  post_create: { board_id: number };
  post_like: undefined;
  post_share: undefined;
  post_report: { reason: string };
  territory_setup: undefined;
  territory_challenge: { result: 'captured' | 'failed' };
  territory_develop: { result: 'success' | 'failed' };
  shop_purchase: { item_id: string };
  gashapon_draw: { item_id: string };
  character_save: undefined;
  chat_send: { chatbot_id: string };
}

type EventName = keyof AnalyticsEvents;
type EventArgs<K extends EventName> = AnalyticsEvents[K] extends undefined
  ? []
  : [params: AnalyticsEvents[K]];

/**
 * 분석 전송이 실패해도 사용자 동작에는 영향을 주지 않도록 에러를 삼킨다.
 * 모듈러 `logEvent`는 내부 Promise를 `void`로 버려 네이티브 거부가 unhandled rejection이 되므로,
 * Promise를 돌려주는 인스턴스 메서드를 직접 호출한다.
 */
export function trackEvent<K extends EventName>(name: K, ...[params]: EventArgs<K>): void {
  Promise.resolve()
    .then(() => getAnalytics().logEvent(name, params))
    .catch(() => {});
}

export const toAnalyticsMethod = (provider: Provider) =>
  provider.toLowerCase() as Lowercase<Provider>;

/** 서버의 내부 user_id만 쓴다. 로그아웃·탈퇴 때 `null`로 지워 다음 계정과 섞이지 않게 한다. */
export function setAnalyticsUserId(userId: string | null): void {
  setUserId(getAnalytics(), userId).catch(() => {});
}
