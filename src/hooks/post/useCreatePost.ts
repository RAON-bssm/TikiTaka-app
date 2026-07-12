import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPost } from '@/api/post';
import type { CreatePostRequest } from '@/types/post';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CreatePostRequest) => createPost(req),
    onSuccess: () => {
      // 게시글 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.log('error:', error);
    },
  });
}
