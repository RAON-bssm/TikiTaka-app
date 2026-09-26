import { createPost, getPosts } from '@/api/post';
import { postKeys, rankingKeys, userKeys } from '@/api/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface UploadPostParams {
  fileUri: string;
  boardId: number;
  content: string;
}

export function useUploadPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileUri, boardId, content }: UploadPostParams) => {
      await createPost({ board_id: boardId, fileUri, content });
      // 생성 응답에 post_id가 없어서, createdAt desc 목록의 첫 항목을 방금 올린 글로 본다.
      const posts = await getPosts(boardId);
      return posts[0]?.post_id ?? null;
    },
    onSuccess: () => {
      // 게시물 작성·삭제는 서버에서 동네·개인 점수를 바꾸므로 랭킹·유저 키도 함께 무효화한다.
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: rankingKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      // 서버 거부 사유는 error.response.data에 있어 Axios 객체만 찍으면 보이지 않는다.
      if (axios.isAxiosError(error)) {
        console.log('upload post error status:', error.response?.status);
        console.log('upload post error body:', JSON.stringify(error.response?.data));
      } else {
        console.log('upload post error:', error);
      }
    },
  });
}
