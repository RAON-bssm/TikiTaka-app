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
      // 목록과 상세를 함께 무효화한다. (postKeys.all이 두 키의 공통 접두사)
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.log('error:', error);
    },
  });
}
