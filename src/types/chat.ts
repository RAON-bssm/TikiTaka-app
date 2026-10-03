import type { DateTimeString } from './api';

export interface Chatbot {
  chatbot_id: string;
  name: string;
  description?: string;
  /** URL이 아니라 S3 key */
  profile_image?: string;
  /** 대화한 적이 없으면 키가 빠진다. */
  last_message?: string;
  last_message_at?: DateTimeString;
}

export interface ChatbotListData {
  chatbot: Chatbot[];
}

export interface SendChatRequest {
  message: string;
}

export interface ChatReplyData {
  message_id: string;
  reply: string;
  /** 답변 근거가 된 동네 정보. 벡터DB 연동 전이라 형태 미정이고, 비어 있으면 키가 빠진다. */
  sources?: unknown[];
  created_at: DateTimeString;
}

export interface ChatReply {
  message_id: string;
  reply: string;
  sources: unknown[];
  created_at: DateTimeString;
}

export interface ChatMessage {
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: unknown[];
  created_at: DateTimeString;
}

/** messages는 오래된 것부터 최신 순이다. */
export interface ChatHistoryData {
  chatbot_id: string;
  messages: ChatMessage[];
  /** 다음 페이지 커서. 더 없으면 키가 빠진다. */
  next_before?: DateTimeString;
  has_more: boolean;
}
