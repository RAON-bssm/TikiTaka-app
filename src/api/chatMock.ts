// TODO: 챗봇(AI 서버) 복구되면 이 파일과 chat.ts의 CHAT_MOCK 분기, .env의 EXPO_PUBLIC_CHAT_MOCK을 지운다.
// AI 서버가 내려가 질문 전송이 503으로 실패하는 동안 화면을 확인하려는 임시 목이다.
// 기록도 함께 흉내 내야 한다. 전송 성공 뒤 기록을 다시 받아 오면 서버에 없는 목 대화가 사라진다.
import type { ChatMessage, ChatReply } from '@/types/chat';

/** 개발 빌드에서 .env에 EXPO_PUBLIC_CHAT_MOCK=1일 때만 켠다. */
export const CHAT_MOCK = __DEV__ && process.env.EXPO_PUBLIC_CHAT_MOCK === '1';

const REPLIES = [
  '사상구면 삼락생태공원임. 저녁에 강바람 불어서 걷기 좋음',
  '그건 잘 모르겠음. 동네 사람들한테 물어보는 게 빠를 듯',
  '역 근처 골목에 국밥집 많음. 하나 골라서 가봐',
  '주말엔 사람 많으니까 평일 저녁에 가는 거 추천함',
];
const DELAY_MS = 1500;

const store = new Map<string, ChatMessage[]>();
let seq = 0;

/** 서버처럼 타임존 오프셋 없는 KST 문자열 */
const nowKst = () => new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19);

export async function mockSendChat(chatbotId: string, message: string): Promise<ChatReply> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  seq += 1;
  const reply: ChatReply = {
    message_id: `mock-${seq}`,
    reply: REPLIES[seq % REPLIES.length],
    sources: [],
    created_at: nowKst(),
  };
  store.set(chatbotId, [
    ...(store.get(chatbotId) ?? []),
    { message_id: `mock-q-${seq}`, role: 'user', content: message, created_at: reply.created_at },
    {
      message_id: reply.message_id,
      role: 'assistant',
      content: reply.reply,
      created_at: reply.created_at,
    },
  ]);
  return reply;
}

export async function mockGetChatHistory(chatbotId: string, size: number): Promise<ChatMessage[]> {
  return (store.get(chatbotId) ?? []).slice(-size);
}
