import { useQuery } from '@tanstack/react-query';

import { getMyPosts } from '@/api/post';
import { postKeys } from '@/api/queryKeys';

export function useMyPosts() {
  return useQuery({
    queryKey: postKeys.mine(),
    queryFn: getMyPosts,
  });
}
