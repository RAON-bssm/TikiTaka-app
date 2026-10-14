import type { ApiResponse } from './api';

export type ReportReason = 'SPAM' | 'ABUSE' | 'SEXUAL' | 'PRIVACY' | 'FAKE_MISSION' | 'OTHER';

export type UserReportReason = Exclude<ReportReason, 'FAKE_MISSION'>;

/** `detail`은 최대 200자이고, `reason`이 `OTHER`이면 필수다(둘 다 어기면 400). */
export interface ReportRequest<R extends ReportReason = ReportReason> {
  reason: R;
  detail?: string;
}

export interface ReportData {
  report_id: number;
}

/**
 * `POST /api/post/{post_id}/report`. 바디와 HTTP 상태 모두 201.
 * 실패: 400 본인 게시물, 404 없거나 삭제된 게시물, 409 이미 신고함.
 */
export type ReportPostResponse = ApiResponse<ReportData>;

/**
 * `POST /api/user/{user_id}/report`(user_id는 UUID). 바디와 HTTP 상태 모두 201.
 * 실패: 400 자기 자신, 404 없는 유저, 409 이미 신고함.
 */
export type ReportUserResponse = ApiResponse<ReportData>;
