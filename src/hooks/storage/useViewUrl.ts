import { useQuery } from '@tanstack/react-query';

import { getViewUrl } from '@/api/storage';
import { storageKeys } from '@/api/queryKeys';

// presigned URL 유효시간(10분)보다 짧게 잡아 만료 전에 갱신되게 한다.
const VIEW_URL_STALE_TIME = 9 * 60 * 1000;

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

/**
 * 서버는 이미지 필드로 S3 객체 key를 내려주는데 `<Image>`에 바로 넣으면 표시되지 않는다.
 * key면 presigned 조회 URL을 발급받고, 이미 절대 URL이면 그대로 쓴다.
 */
export function useViewUrl(key: string | undefined) {
  const query = useQuery({
    queryKey: storageKeys.viewUrl(key),
    queryFn: () => getViewUrl(key as string),
    enabled: !!key && !isAbsoluteUrl(key),
    staleTime: VIEW_URL_STALE_TIME,
  });

  if (!key || isAbsoluteUrl(key)) {
    return { uri: key, isLoading: false, isError: false } as const;
  }

  return { uri: query.data, isLoading: query.isLoading, isError: query.isError } as const;
}
