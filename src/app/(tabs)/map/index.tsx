import { isAxiosError } from 'axios';
import { useState } from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';

import { getApiErrorMessage } from '@/api/error';
import ChatPanel from '@/components/chat/ChatPanel';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { DEFAULT_CHARACTER_CONFIG } from '@/constants/character/assets';
import { useChatbots } from '@/hooks/chat/useChatbots';
import { useSendChat } from '@/hooks/chat/useSendChat';
import { useMapBridge } from '@/hooks/map/useMapBridge';
import { useMyInfo } from '@/hooks/user/useMyInfo';
import type { MapCharacter, Neighborhood } from '@/types/mapBridge';

const MAP_WEB_URL = process.env.EXPO_PUBLIC_MAP_WEB_URL;

const replyDurationMs = (text: string) => Math.min(15_000, Math.max(4_000, text.length * 150));

function getChatErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
      return '챗봇 답변이 늦어지고 있어요.';
    }
    if (error.response?.status === 404) return '대화할 수 없는 챗봇이에요.';
    if (error.response?.status === 503)
      return '챗봇이 지금 대답할 수 없어요. 잠시 후 다시 시도해주세요.';
  }
  return getApiErrorMessage(error);
}

export default function MapScreen() {
  const myInfo = useMyInfo();
  const mainLocation = myInfo.data?.main_location;
  const neighborhood: Neighborhood | null = mainLocation
    ? {
        locationId: mainLocation.location_id,
        cityName: mainLocation.location_city_name,
        name: mainLocation.location_name,
      }
    : null;

  const { showToast } = useToast();
  const chatbots = useChatbots();
  const { mutate: sendChat, isPending, variables } = useSendChat();
  const [chatbotId, setChatbotId] = useState<string>();
  const [replies, setReplies] = useState<Record<string, string>>({});

  // 챗봇 외형은 서버에 없어 기본 모양으로 그린다. 캐릭터 id = chatbot_id라 탭 이벤트로 바로 대화한다.
  const characters: MapCharacter[] =
    chatbots.data?.map((chatbot) => ({
      id: chatbot.chatbot_id,
      name: chatbot.name,
      config: DEFAULT_CHARACTER_CONFIG,
      kind: 'npc',
    })) ?? [];
  const chatbot = chatbots.data?.find((item) => item.chatbot_id === chatbotId);

  const { webViewRef, status, onMessage, fail, reload, sendToMap } = useMapBridge({
    neighborhood,
    characters,
    onCharacterTap: setChatbotId,
  });

  const handleSend = (message: string) => {
    if (!chatbotId) return;
    const characterId = chatbotId;

    sendToMap({ type: 'showTyping', characterId });
    sendChat(
      { chatbotId: characterId, message },
      {
        onSuccess: ({ reply }) => {
          setReplies((prev) => ({ ...prev, [characterId]: reply }));
          sendToMap({
            type: 'showBubble',
            characterId,
            text: reply,
            durationMs: replyDurationMs(reply),
          });
        },
        onError: (error) => {
          sendToMap({ type: 'hideBubble', characterId });
          showToast(getChatErrorMessage(error));
        },
      },
    );
  };

  if (!MAP_WEB_URL) {
    return (
      <View className="flex-1 items-center justify-center gap-sm bg-gray-50 px-xl">
        <Typography variant="body2" className="text-center text-gray-500">
          지도 주소가 설정되지 않았어요.
        </Typography>
        <Typography variant="caption" className="text-center text-gray-400">
          .env에 EXPO_PUBLIC_MAP_WEB_URL을 추가하고 앱을 다시 시작해주세요.
        </Typography>
      </View>
    );
  }

  const isError = status === 'error' || myInfo.isError;
  const onRetry = () => {
    if (myInfo.isError) void myInfo.refetch();
    reload();
  };

  return (
    // 지도는 노치·상태바 영역까지 채운다. 지도 위에 버튼 등을 올릴 때는 safe area를 따로 챙길 것.
    <View className="flex-1 bg-gray-50">
      <WebView
        ref={webViewRef}
        source={{ uri: MAP_WEB_URL }}
        onMessage={onMessage}
        // iOS가 상태바 높이만큼 콘텐츠를 자동으로 내리지 않게 한다.
        contentInsetAdjustmentBehavior="never"
        onError={fail}
        onHttpError={fail}
        // 메모리 부족 등으로 WebView 프로세스가 종료되면 흰 화면으로 남으므로 다시 띄운다.
        onContentProcessDidTerminate={reload}
        onRenderProcessGone={reload}
        setSupportMultipleWindows={false}
        webviewDebuggingEnabled={__DEV__}
      />

      {/* WebView는 로드가 계속돼야 하므로 언마운트하지 않고 위에 덮는다. */}
      {isError ? (
        <View className="absolute inset-0 justify-center bg-gray-50">
          <ErrorRetry message="지도를 불러오지 못했어요." onRetry={onRetry} />
        </View>
      ) : (
        status === 'loading' && <Skeleton className="absolute inset-0" />
      )}

      {status === 'loaded' && chatbot && (
        <ChatPanel
          key={chatbot.chatbot_id}
          name={chatbot.name}
          reply={replies[chatbot.chatbot_id]}
          isPending={isPending && variables?.chatbotId === chatbot.chatbot_id}
          onSend={handleSend}
          onClose={() => setChatbotId(undefined)}
        />
      )}
    </View>
  );
}
