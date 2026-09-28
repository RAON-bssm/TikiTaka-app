import { createPost } from '@/api/post';
import { postKeys, rankingKeys, userKeys } from '@/api/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UploadPostParams {
  fileUri: string;
  boardId: number;
  content: string;
}

export function useUploadPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileUri, boardId, content }: UploadPostParams) =>
      createPost({ board_id: boardId, fileUri, content }),
    onSuccess: () => {
      // 게시물 작성·삭제는 서버에서 동네·개인 점수를 바꾸므로 랭킹·유저 키도 함께 무효화한다.
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: rankingKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
