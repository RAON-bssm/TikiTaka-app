import { isAxiosError } from 'axios';

import type { ApiErrorResponse } from '@/types/api';

const UNKNOWN_ERROR_MESSAGE = '잠시 후 다시 시도해주세요.';
const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인해주세요.';

/**
 * 실패한 요청에서 사용자에게 보여줄 문구를 꺼낸다.
 * 서버가 보낸 사유를 우선 쓰고, 없으면 `fallback`으로 내려간다.
 *
 * 시큐리티 필터에서 막힌 401/403은 공통 래퍼가 아니라 스프링 기본 에러 바디로 오는데,
 * 서버에 `server.error.include-message` 설정이 없어 `message`가 **빈 문자열**로 온다.
 * 그래서 값의 존재가 아니라 공백을 털어낸 결과로 판단한다.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback: string = UNKNOWN_ERROR_MESSAGE,
): string {
  if (!isAxiosError(error)) {
    return fallback;
  }
  if (!error.response) {
    return NETWORK_ERROR_MESSAGE;
  }

  // 공통 래퍼가 아닐 수도 있어(스프링 기본 바디, HTML 등) 필드 존재를 가정하지 않는다.
  const body = error.response.data as Partial<ApiErrorResponse> | undefined;
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  return message || fallback;
}
