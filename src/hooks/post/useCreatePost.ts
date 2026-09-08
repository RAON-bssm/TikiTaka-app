import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPost } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import type { CreatePostRequest } from '@/types/post';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CreatePostRequest) => createPost(req),
    onSuccess: () => {
      // 목록·상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.log('error:', error);
    },
  });
}
