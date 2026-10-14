import { useMutation } from '@tanstack/react-query';

import { reportPost } from '@/api/report';
import type { ReportRequest } from '@/types/report';

export function useReportPost() {
  return useMutation({
    mutationFn: ({ postId, req }: { postId: string; req: ReportRequest }) =>
      reportPost(postId, req),
  });
}
