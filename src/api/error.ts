import { isAxiosError } from 'axios';

import type { ApiErrorResponse } from '@/types/api';

/** 실패 사유를 알 수 없을 때 보여줄 문구. */
const UNKNOWN_ERROR_MESSAGE = '잠시 후 다시 시도해주세요.';

/** 서버에 닿지도 못한 경우(타임아웃·연결 실패)의 문구. */
const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인해주세요.';

/**
 * 실패한 요청에서 **사용자에게 보여줄 문구**를 꺼낸다.
 *
 * 서버는 실패 사유를 공통 래퍼의 `message`에 담아 보낸다(닉네임 중복, 포인트 부족 등).
 * 화면마다 일반 문구로 덮어써 버리면 사용자는 왜 실패했는지 알 수 없으므로, 이 함수로
 * 서버 문구를 우선 쓰고 없을 때만 대체 문구로 내려간다.
 *
 * 세 갈래로 갈린다.
 * - 응답이 없으면(네트워크) → 연결 확인 문구
 * - 서버가 사유를 보냈으면 → 그 문구
 * - 사유가 없거나 axios 에러가 아니면 → `fallback`
 *
 * **서버 문구가 항상 오지는 않는다.** 시큐리티 필터에서 막힌 401/403은 공통 래퍼를 거치지
 * 않고 스프링 기본 에러 바디로 내려오는데, 서버에 `server.error.include-message`가
 * 설정돼 있지 않아 `message`가 **빈 문자열**로 온다. 그래서 값의 존재만 보지 않고
 * 공백을 털어낸 뒤 판단한다.
 *
 * @param fallback 서버가 사유를 주지 않았을 때 쓸 문구. 화면 맥락에 맞게 넘긴다.
 * @returns 그대로 `showToast`에 넘길 수 있는 문구
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

  // 공통 래퍼가 아닐 수도 있으므로(스프링 기본 에러 바디, HTML 등) 필드 존재를 가정하지 않는다.
  const body = error.response.data as Partial<ApiErrorResponse> | undefined;
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  return message || fallback;
}
