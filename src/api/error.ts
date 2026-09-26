import { isAxiosError } from 'axios';

import type { ApiErrorResponse } from '@/types/api';

const UNKNOWN_ERROR_MESSAGE = '잠시 후 다시 시도해주세요.';
const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인해주세요.';

/**
 * 서버가 보낸 사유를 우선 쓰고, 없으면 `fallback`.
 * 시큐리티 필터의 401/403은 스프링 기본 바디라 `message`가 빈 문자열로 오므로 trim 결과로 판단한다.
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

  // 공통 래퍼가 아닐 수 있다(스프링 기본 바디, HTML 등).
  const body = error.response.data as Partial<ApiErrorResponse> | undefined;
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  return message || fallback;
}
