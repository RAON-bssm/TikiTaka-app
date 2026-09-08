import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePost } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import { UpdatePostRequest } from '@/types/post';

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, req }: { postId: string; req: UpdatePostRequest }) =>
      updatePost(postId, req),
    onSuccess: () => {
      // 목록·상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.log('error:', error);
    },
  });
}
