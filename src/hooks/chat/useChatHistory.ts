import { useQuery } from '@tanstack/react-query';

import { getChatHistory } from '@/api/chat';
import { chatKeys } from '@/api/queryKeys';

/** 지도 위에는 최근 2쌍(질문·답)만 쌓는다. */
export const CHAT_HISTORY_SIZE = 4;

export function useChatHistory(chatbotId: string | undefined) {
  return useQuery({
    queryKey: chatKeys.history(chatbotId ?? ''),
    queryFn: () => getChatHistory(chatbotId!, CHAT_HISTORY_SIZE),
    enabled: !!chatbotId,
  });
}
