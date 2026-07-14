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
