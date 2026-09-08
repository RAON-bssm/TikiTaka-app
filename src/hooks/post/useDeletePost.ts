import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePost } from '@/api/post';
import { postKeys } from '@/api/queryKeys';

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      // 목록·상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.log('error:', error);
    },
  });
}
