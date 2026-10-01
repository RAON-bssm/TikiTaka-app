import { useMutation } from '@tanstack/react-query';

import { sendChat } from '@/api/chat';

interface Variables {
  chatbotId: string;
  message: string;
}

export function useSendChat() {
  return useMutation({
    mutationFn: ({ chatbotId, message }: Variables) => sendChat(chatbotId, message),
  });
}
