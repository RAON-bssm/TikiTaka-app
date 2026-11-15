import { useMutation } from '@tanstack/react-query';

import { trackEvent } from '@/api/analytics';
import { reportPost } from '@/api/report';
import type { ReportRequest } from '@/types/report';

export function useReportPost() {
  return useMutation({
    mutationFn: ({ postId, req }: { postId: string; req: ReportRequest }) =>
      reportPost(postId, req),
    // 상세 사유(detail)는 사용자가 직접 쓴 글이라 보내지 않는다.
    onSuccess: (_data, { req }) => trackEvent('post_report', { reason: req.reason }),
  });
}
