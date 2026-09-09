import { useQuery } from '@tanstack/react-query';

import { getPostDetail } from '@/api/post';
import { postKeys } from '@/api/queryKeys';

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => getPostDetail(postId),
  });
}
