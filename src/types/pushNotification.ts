/**
 * FCM 메시지의 `data.type`. 서버와 맞춘 값이다(값은 전부 문자열). 문구는 서버 환경변수로 바뀔 수 있어 문구가 아니라 이 값으로 분기한다.
 * - `DAILY_WAGE`: 매일 08:00 일급 지급. 금액은 알림에 싣지 않고 앱이 일급 내역 API로 받는다.
 * - `TERRITORY_CAPTURED`: 내 땅을 뺏김. `data.dong_code`(문자열)가 함께 온다. 주인 없던 땅을 처음 차지한 경우엔 오지 않는다.
 * 목록에 없는 type은 무시한다(알림 종류가 늘어나도 옛 앱이 깨지지 않게).
 */
export type PushType = 'DAILY_WAGE' | 'TERRITORY_CAPTURED';
