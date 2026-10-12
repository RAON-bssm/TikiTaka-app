import type {
  ReportPostResponse,
  ReportRequest,
  ReportUserResponse,
  UserReportReason,
} from '@/types/report';
import client from './client';

export async function reportPost(postId: string, req: ReportRequest): Promise<number> {
  const { data } = await client.post<ReportPostResponse>(`/api/post/${postId}/report`, req);
  return data.data.report_id;
}

export async function reportUser(
  userId: string,
  req: ReportRequest<UserReportReason>,
): Promise<number> {
  const { data } = await client.post<ReportUserResponse>(`/api/user/${userId}/report`, req);
  return data.data.report_id;
}
