import { createPost, getPosts } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

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
    mutationFn: async ({ fileUri, boardId, content }: UploadPostParams) => {
      await createPost({ board_id: boardId, fileUri, content });
      // 서버 생성 응답은 post_id를 주지 않는다(ApiResponse<Void>).
      // 목록은 createdAt desc 정렬이라, 방금 올린 글이 첫 항목이므로 그 id를 상세 이동에 쓴다.
      const posts = await getPosts(boardId);
      return posts[0]?.post_id ?? null;
    },
    onSuccess: () => {
      // 목록·상세 캐시 무효화 → 피드가 자동으로 새 글을 반영한다.
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      // 400 등 서버 거부 사유는 error.response.data에 담겨 온다. Axios 객체만 찍으면 보이지 않으므로 분리해 로깅한다.
      if (axios.isAxiosError(error)) {
        console.log('upload post error status:', error.response?.status);
        console.log('upload post error body:', JSON.stringify(error.response?.data));
      } else {
        console.log('upload post error:', error);
      }
    },
  });
}
