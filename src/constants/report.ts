import type { ReportReason, UserReportReason } from '@/types/report';

export const REPORT_DETAIL_MAX_LENGTH = 200;

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  SPAM: '스팸·광고',
  ABUSE: '욕설·혐오·비방',
  SEXUAL: '음란·선정적인 내용',
  PRIVACY: '개인정보·초상권 침해',
  FAKE_MISSION: '미션과 무관하거나 조작된 인증',
  OTHER: '기타',
};

export const POST_REPORT_REASONS: ReportReason[] = [
  'SPAM',
  'ABUSE',
  'SEXUAL',
  'PRIVACY',
  'FAKE_MISSION',
  'OTHER',
];

export const USER_REPORT_REASONS: UserReportReason[] = [
  'SPAM',
  'ABUSE',
  'SEXUAL',
  'PRIVACY',
  'OTHER',
];
