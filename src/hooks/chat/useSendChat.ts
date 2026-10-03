import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sendChat } from '@/api/chat';
import { chatKeys } from '@/api/queryKeys';
import type { ChatMessage } from '@/types/chat';

interface Variables {
  chatbotId: string;
  message: string;
}

export function useSendChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatbotId, message }: Variables) => sendChat(chatbotId, message),
    onSuccess: (reply, { chatbotId, message }) => {
      // 다시 받아 오기 전까지 보낸 질문이 사라졌다 나타나지 않게 캐시에 먼저 붙인다.
      // 서버는 질문의 id를 주지 않아 임시 id를 쓰고, 아래 무효화로 서버 값으로 바뀐다.
      queryClient.setQueryData<ChatMessage[]>(chatKeys.history(chatbotId), (prev = []) => [
        ...prev,
        {
          message_id: `local-${reply.message_id}`,
          role: 'user',
          content: message,
          created_at: reply.created_at,
        },
        {
          message_id: reply.message_id,
          role: 'assistant',
          content: reply.reply,
          sources: reply.sources,
          created_at: reply.created_at,
        },
      ]);
      // 챗봇 목록의 last_message도 바뀐다.
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}
