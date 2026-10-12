import { useMutation } from '@tanstack/react-query';

import { reportUser } from '@/api/report';
import type { ReportRequest, UserReportReason } from '@/types/report';

export function useReportUser() {
  return useMutation({
    mutationFn: ({ userId, req }: { userId: string; req: ReportRequest<UserReportReason> }) =>
      reportUser(userId, req),
  });
}
