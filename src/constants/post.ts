import type { PostStatus } from '@/types/post';

interface PostReviewNotice {
  label: string;
  title: string;
  description: string;
}

/** 심사가 끝나지 않았거나 통과하지 못한 글에 점수 대신 보여줄 안내. `label`은 목록 배지, 나머지는 상세 카드에 쓴다. */
const POST_REVIEW_NOTICE: Record<Exclude<PostStatus, 'DONE'>, PostReviewNotice> = {
  PENDING: {
    label: '심사 중',
    title: 'AI 심사 중',
    description: 'AI가 심사하고 있어요. 결과가 나오면 점수와 포인트가 반영돼요.',
  },
  REJECTED: {
    label: '거절',
    title: '심사 거절',
    description: 'AI 심사를 통과하지 못했어요. 다른 사진이나 내용으로 다시 올려주세요.',
  },
  FAILED: {
    label: '심사 실패',
    title: '심사 실패',
    description: '일시적인 문제로 심사하지 못했어요.',
  },
  EXPIRED: {
    label: '반영 안 됨',
    title: '점수 미반영',
    description: '시즌이 종료되어 점수가 반영되지 않았어요.',
  },
};

const UNKNOWN_REVIEW_NOTICE: PostReviewNotice = {
  label: '확인 불가',
  title: '심사 상태 확인 불가',
  description: '심사 상태를 확인하지 못했어요. 잠시 후 다시 확인해주세요.',
};

export function getPostReviewNotice(status: PostStatus): PostReviewNotice {
  return (
    (POST_REVIEW_NOTICE as Partial<Record<string, PostReviewNotice>>)[status] ??
    UNKNOWN_REVIEW_NOTICE
  );
}
