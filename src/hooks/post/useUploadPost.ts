import { createPost } from '@/api/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UploadPostParams {
  fileUri: string;
  boardId: number;
  content: string;
}

/**
 * 사진 촬영 → 게시물 업로드 전체 흐름을 하나로 묶은 훅.
 *
 * 사진 파일과 본문을 multipart/form-data로 묶어 게시물 생성 API에 한 번에 보낸다.
 * 실패하면 onError로 간다.
 */
export function useUploadPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileUri, boardId, content }: UploadPostParams) =>
      createPost({ board_id: boardId, fileUri, content }),
    onSuccess: () => {
      // 게시물 목록 캐시 무효화 → 피드가 자동으로 새 글을 반영한다.
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.log('upload post error:', error);
    },
  });
}
