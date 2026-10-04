import { isAxiosError } from 'axios';
import { useIsFocused } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import WebView from 'react-native-webview';

import { getApiErrorMessage } from '@/api/error';
import ChatPanel from '@/components/chat/ChatPanel';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { DEFAULT_CHARACTER_CONFIG } from '@/constants/character/assets';
import { useChatbots } from '@/hooks/chat/useChatbots';
import { useChatHistory } from '@/hooks/chat/useChatHistory';
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
  const { mutateAsync: sendChat } = useSendChat();
  const isFocused = useIsFocused();
  const [chatbotId, setChatbotId] = useState<string>();
  /** 챗봇 id → 답을 기다리는 질문 */
  const [pendingMessages, setPendingMessages] = useState<Record<string, string>>({});
  const panelHeight = useRef<number>(undefined);
  /** 답이 늦게 왔을 때 그 챗봇과 아직 대화 중인지 판단한다. state는 응답 시점의 클로저에서 옛 값이라 ref로 둔다. */
  const openChatbotId = useRef<string>(undefined);

  // 챗봇 외형은 서버에 없어 기본 모양으로 그린다. 캐릭터 id = chatbot_id라 탭 이벤트로 바로 대화한다.
  const characters: MapCharacter[] =
    chatbots.data?.map((chatbot) => ({
      id: chatbot.chatbot_id,
      name: chatbot.name,
      config: DEFAULT_CHARACTER_CONFIG,
      kind: 'npc',
    })) ?? [];
  const chatbot = chatbots.data?.find((item) => item.chatbot_id === chatbotId);
  const history = useChatHistory(chatbotId);

  const { webViewRef, status, onMessage, fail, reload, sendToMap } = useMapBridge({
    neighborhood,
    characters,
    onCharacterTap: (characterId) => openChat(characterId),
    onMapTap: () => {
      if (openChatbotId.current) closeChat();
    },
    onMapMoveStart: () => {
      if (openChatbotId.current) closeChat();
    },
    onMapLoaded: () => {
      // 웹이 스스로 다시 로드되면 패널은 그대로라 다시 마운트되지 않으므로 여기서 포커스를 다시 맞춘다.
      // status가 loaded가 아니었다면 패널이 지금 새로 마운트되며 포커스를 보낸다.
      if (status === 'loaded' && chatbotId) focus(chatbotId);
    },
  });

  // 웹은 결과를 알려 주지 않는다. 숨겨졌거나 표시 상한 밖인 캐릭터면 조용히 무시된다.
  const focus = (characterId: string) =>
    sendToMap({ type: 'focusCharacter', characterId, bottomInsetPx: panelHeight.current });

  // 패널이 열린 채 다른 캐릭터를 탭하면 패널이 새로 마운트되며 그 캐릭터로 포커스를 옮긴다.
  // 이전 캐릭터의 멈춤은 웹이 풀어 주므로 clearFocus는 보내지 않지만, 남겨 둔 말풍선은 지운다.
  const openChat = (characterId: string) => {
    const previous = openChatbotId.current;
    if (previous && previous !== characterId) {
      sendToMap({ type: 'hideBubble', characterId: previous });
    }
    openChatbotId.current = characterId;
    setChatbotId(characterId);
  };

  // 패널이 닫히는 모든 경로가 여기를 거쳐야 한다. 하나라도 빠지면 그 캐릭터가 계속 멈춰 있고 말풍선도 남는다.
  const closeChat = () => {
    const previous = openChatbotId.current;
    if (previous) sendToMap({ type: 'hideBubble', characterId: previous });
    openChatbotId.current = undefined;
    setChatbotId(undefined);
    sendToMap({ type: 'clearFocus' });
  };

  const closeOnLeave = useEffectEvent(() => closeChat());
  const closeOnBack = useEffectEvent(() => {
    closeChat();
    return true;
  });

  // 다른 탭으로 가면 패널을 닫는다(포커스를 잃을 때 cleanup이 돈다).
  useEffect(() => {
    if (!isFocused) return;
    return () => closeOnLeave();
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused || !chatbotId) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => closeOnBack());
    return () => subscription.remove();
  }, [isFocused, chatbotId]);

  // 응답 처리는 패널이 아니라 이 화면에 둔다. 답을 기다리다 패널을 닫아도 말풍선을 끝까지 정리해야 한다.
  // mutate의 호출별 콜백은 마지막 호출에만 실행돼, 여러 챗봇에 동시에 물으면 앞선 '…'가 60초 남는다. 그래서 mutateAsync를 쓴다.
  const handleSend = async (message: string) => {
    if (!chatbotId) return;
    const characterId = chatbotId;

    sendToMap({ type: 'showTyping', characterId });
    setPendingMessages((prev) => ({ ...prev, [characterId]: message }));
    try {
      const { reply } = await sendChat({ chatbotId: characterId, message });
      // 대화 중이면 다음 입력(showTyping이 교체)이나 패널을 닫을 때까지 남긴다.
      // 그 사이 패널을 닫았으면 지울 사람이 없으므로 잠깐만 보여 준다.
      const isOpen = openChatbotId.current === characterId;
      sendToMap({
        type: 'showBubble',
        characterId,
        text: reply,
        ...(isOpen ? { persistent: true } : { durationMs: replyDurationMs(reply) }),
      });
    } catch (error) {
      sendToMap({ type: 'hideBubble', characterId });
      showToast(getChatErrorMessage(error));
    } finally {
      setPendingMessages((prev) => {
        const { [characterId]: _, ...rest } = prev;
        return rest;
      });
    }
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
          messages={history.data ?? []}
          pendingMessage={pendingMessages[chatbot.chatbot_id]}
          onSend={(message) => void handleSend(message)}
          onClose={closeChat}
          onFirstLayout={(height) => {
            // 패널은 WebView 아래 끝에 붙어 있고 바텀바는 WebView 밖(아래)에 있어,
            // 패널 높이가 곧 WebView에서 가려지는 높이다. 바텀바가 safe area 여백을 맡아 따로 더하지 않는다.
            panelHeight.current = height;
            focus(chatbot.chatbot_id);
          }}
        />
      )}
    </View>
  );
}
