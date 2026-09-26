export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

/** 자바 `LocalDateTime`이라 타임존 오프셋이 없다(서버 KST 기준). 예: `'2026-09-07T21:34:56.789'` */
export type DateTimeString = string;

/** 바디 `status`로 성공을 판정하지 말 것 — `ApiResponse.of(204, ...)`여도 HTTP는 200이다. */
export type EmptyResponse = ApiResponse<null>;

/** 시큐리티 필터에서 막힌 401/403은 이 형태가 아니라 스프링 기본 바디라 `message`가 없을 수 있다. */
export type ApiErrorResponse = EmptyResponse;
