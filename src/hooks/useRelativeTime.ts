const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

/**
 * ISO 날짜 문자열(또는 Date)을 "3시간 전", "3일 전", "1주 전", "1개월 전", "2년 전"
 * 형태의 한국어 상대 시간 문자열로 변환한다.
 *
 * - 1분 미만: "방금 전"
 * - 그 외에는 가장 큰 단위 하나로만 표기(분/시간/일/주/개월/년).
 * - 미래 시각이 들어와도 음수가 나오지 않도록 0으로 클램프한다.
 */
export function formatRelativeTime(date: string | Date): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  const targetMs = target.getTime();

  // 파싱 실패(Invalid Date) 시 빈 문자열로 안전하게 처리
  if (Number.isNaN(targetMs)) return '';

  const diffSec = Math.max(0, Math.floor((Date.now() - targetMs) / 1000));

  if (diffSec < MINUTE) return '방금 전';
  if (diffSec < HOUR) return `${Math.floor(diffSec / MINUTE)}분 전`;
  if (diffSec < DAY) return `${Math.floor(diffSec / HOUR)}시간 전`;
  if (diffSec < WEEK) return `${Math.floor(diffSec / DAY)}일 전`;
  if (diffSec < MONTH) return `${Math.floor(diffSec / WEEK)}주 전`;
  if (diffSec < YEAR) return `${Math.floor(diffSec / MONTH)}개월 전`;
  return `${Math.floor(diffSec / YEAR)}년 전`;
}

/**
 * 상대 시간 문자열을 반환하는 훅.
 *
 * 값은 렌더 시점 기준으로 계산된다. 화면에 머무는 동안 자동으로 갱신되지는 않지만,
 * 피드처럼 재조회/재진입이 잦은 화면에서는 충분하다.
 */
export default function useRelativeTime(date: string | Date): string {
  return formatRelativeTime(date);
}
