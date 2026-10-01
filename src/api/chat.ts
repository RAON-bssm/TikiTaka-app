import type { ApiResponse } from '@/types/api';
import type {
  ChatReply,
  ChatReplyData,
  Chatbot,
  ChatbotListData,
  SendChatRequest,
} from '@/types/chat';
import client from './client';

const CHAT_TIMEOUT_MS = 60_000;

export async function getChatbots(): Promise<Chatbot[]> {
  const { data } = await client.get<ApiResponse<ChatbotListData>>('/api/chatbot');
  return data.data.chatbot;
}

export async function sendChat(chatbotId: string, message: string): Promise<ChatReply> {
  const { data } = await client.post<ApiResponse<ChatReplyData>>(
    '/api/chat',
    { message } satisfies SendChatRequest,
    { params: { chatbot_id: chatbotId }, timeout: CHAT_TIMEOUT_MS },
  );
  return { ...data.data, sources: data.data.sources ?? [] };
}
