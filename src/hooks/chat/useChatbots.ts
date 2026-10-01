import { useQuery } from '@tanstack/react-query';

import { getChatbots } from '@/api/chat';
import { chatKeys } from '@/api/queryKeys';

export function useChatbots() {
  return useQuery({
    queryKey: chatKeys.chatbots(),
    queryFn: getChatbots,
  });
}
