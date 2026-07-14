import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePost } from '@/api/post';

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      // 게시글 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.log('error:', error);
    },
  });
}
