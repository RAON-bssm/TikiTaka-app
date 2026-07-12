import { useQuery } from '@tanstack/react-query';

import { getPostDetail } from '@/api/post';

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostDetail(postId),
  });
}
