import { useQuery } from '@tanstack/react-query';

import { getPostDetail } from '@/api/post';
import { postKeys } from '@/api/queryKeys';

/** 심사 중인 글의 결과는 `useMyPosts`가 확인하고, 끝나면 이 상세를 무효화해 다시 받게 한다. */
export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => getPostDetail(postId),
  });
}
