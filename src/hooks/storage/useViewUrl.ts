import { useQuery } from '@tanstack/react-query';

import { getViewUrl } from '@/api/storage';

/** presigned 조회 URL 유효시간(10분)보다 살짝 짧게 잡아 만료 전에 갱신되도록 한다. */
const VIEW_URL_STALE_TIME = 9 * 60 * 1000;

/** 이미 절대 URL(http/https)이면 스토리지 키가 아니라 그대로 쓸 수 있다. */
function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

/**
 * 저장된 이미지 key를 표시용 조회 URL로 변환하는 훅.
 *
 * 서버는 이미지 필드로 S3 객체 key(예: `uuid-....jpg`)를 내려주는데, 이 값 자체는
 * 로드 가능한 URL이 아니므로 `<Image>`에 바로 넣으면 표시되지 않는다. key를 넘기면
 * presigned 조회 URL을 발급받아 반환한다. 이미 절대 URL이면 그대로 반환한다.
 *
 * @returns 표시에 쓸 uri (아직 발급 전이면 undefined)
 */
export function useViewUrl(key: string | undefined) {
  const query = useQuery({
    queryKey: ['viewUrl', key],
    queryFn: () => getViewUrl(key as string),
    enabled: !!key && !isAbsoluteUrl(key),
    staleTime: VIEW_URL_STALE_TIME,
  });

  // 절대 URL이거나 key가 비어있으면 발급 없이 원본을 그대로 쓴다.
  if (!key || isAbsoluteUrl(key)) {
    return { uri: key, isLoading: false, isError: false } as const;
  }

  return { uri: query.data, isLoading: query.isLoading, isError: query.isError } as const;
}
