import type { ApiResponse } from '@/types/api';
import type {
  ChatHistoryData,
  ChatMessage,
  ChatReply,
  ChatReplyData,
  Chatbot,
  ChatbotListData,
  SendChatRequest,
} from '@/types/chat';
import { CHAT_MOCK, mockGetChatHistory, mockSendChat } from './chatMock';
import client from './client';

const CHAT_TIMEOUT_MS = 60_000;

export async function getChatbots(): Promise<Chatbot[]> {
  const { data } = await client.get<ApiResponse<ChatbotListData>>('/api/chatbot');
  return data.data.chatbot;
}

export async function sendChat(chatbotId: string, message: string): Promise<ChatReply> {
  if (CHAT_MOCK) return mockSendChat(chatbotId, message);
  const { data } = await client.post<ApiResponse<ChatReplyData>>(
    '/api/chat',
    { message } satisfies SendChatRequest,
    { params: { chatbot_id: chatbotId }, timeout: CHAT_TIMEOUT_MS },
  );
  return { ...data.data, sources: data.data.sources ?? [] };
}

/** 최근 `size`개를 오래된 것부터 돌려준다. 질문과 답은 함께 저장되므로 짝수로 받으면 쌍이 끊기지 않는다. */
export async function getChatHistory(chatbotId: string, size: number): Promise<ChatMessage[]> {
  if (CHAT_MOCK) return mockGetChatHistory(chatbotId, size);
  const { data } = await client.get<ApiResponse<ChatHistoryData>>('/api/chat', {
    params: { chatbot_id: chatbotId, size },
  });
  return data.data.messages;
}
