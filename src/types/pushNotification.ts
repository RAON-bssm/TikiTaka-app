/**
 * FCM 메시지의 `data.type`. 서버와 맞춘 값이다. 알림을 눌러 앱에 들어왔을 때 어떤 팝업을 띄울지 정한다.
 * - `WAGE`: 일급 지급. 금액은 알림에 싣지 않고 앱이 일급 내역 API로 받는다.
 */
export type PushType = 'WAGE';
