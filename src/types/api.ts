/**
 * 서버 공통 응답 래퍼.
 * 모든 API가 { status, message, data } 형태로 감싸서 내려주므로,
 * data의 실제 타입만 제네릭으로 갈아끼워 재사용한다.
 */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

/**
 * 서버 시각 문자열. (예: `'2026-09-07T21:34:56.789'`)
 *
 * 자바 `LocalDateTime`이라 **타임존 오프셋이 없다.** 서버가 KST로 돌아 국내에선 맞아떨어지지만,
 * 기기 타임존이 KST가 아니면 그만큼 어긋난다.
 */
export type DateTimeString = string;

/**
 * data가 없는 응답. (생성·수정·삭제·로그아웃 등)
 *
 * **바디의 `status`를 성공 판정에 쓰면 안 된다.** 서버가 `ApiResponse.of(204, ...)`를
 * 그대로 반환해도 HTTP는 200이라 둘이 어긋난다.
 */
export type EmptyResponse = ApiResponse<null>;

/**
 * 에러 응답 바디. 성공과 같은 래퍼에 `data`만 null이다.
 *
 * 단, **시큐리티 필터에서 막힌 401/403은 이 형태가 아니다.** 스프링 기본 에러 바디가
 * 오므로 `message`가 없을 수 있다.
 */
export type ApiErrorResponse = EmptyResponse;
