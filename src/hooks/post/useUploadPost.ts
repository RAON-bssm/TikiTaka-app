import { createPost, getMyPosts } from '@/api/post';
import { postKeys } from '@/api/queryKeys';
import { invalidateReviewResult } from '@/hooks/post/usePostDetail';
import type { MyPost } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

interface UploadPostParams {
  fileUri: string;
  boardId: number;
  content: string;
}

/**
 * 응답을 못 받았거나(네트워크 끊김·타임아웃) 게이트웨이가 죽은 경우(502/504)는
 * 서버에 실제로는 저장됐을 수 있어 "진짜 실패"와 구분해야 한다.
 */
export const isAmbiguousUploadError = (error: unknown) =>
  isAxiosError(error) &&
  (error.response === undefined || [502, 504].includes(error.response.status));

/**
 * 애매한 실패 후 실제 등록 여부를 확인한다. 보관함 목록이 최신순이므로,
 * 맨 앞 글이 이번에 보낸 board_id·content와 같으면 방금 올라간 것으로 본다.
 */
export async function findJustUploadedPost(
  boardId: number,
  content: string,
): Promise<MyPost | undefined> {
  const myPosts = await getMyPosts();
  const latest = myPosts[0];
  return latest && latest.board_id === boardId && latest.content === content ? latest : undefined;
}

/** 애매한 실패 후 등록 여부 확인(`getMyPosts`) 자체도 실패해, 등록 여부를 알 수 없는 상태. */
export class UploadConfirmationFailedError extends Error {
  constructor() {
    super('게시물 등록 여부를 확인하지 못했습니다.');
    this.name = 'UploadConfirmationFailedError';
  }
}

export function useUploadPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileUri, boardId, content }: UploadPostParams) => {
      try {
        return await createPost({ board_id: boardId, fileUri, content });
      } catch (error) {
        if (!isAmbiguousUploadError(error)) throw error;

        let matched: MyPost | undefined;
        try {
          matched = await findJustUploadedPost(boardId, content);
        } catch {
          throw new UploadConfirmationFailedError();
        }

        // 확인 결과 실제로 등록 안 됨 → 원래 에러로 재시도를 허용한다.
        if (!matched) throw error;
        return { postId: matched.post_id, status: matched.status };
      }
    },
    onSuccess: ({ status }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      // 동기 심사면 등록과 함께 동네·개인 점수와 포인트가 바뀐다. 비동기면 심사가 끝날 때 바뀐다(`invalidateReviewResult`).
      if (status === 'DONE') invalidateReviewResult(queryClient);
    },
  });
}
