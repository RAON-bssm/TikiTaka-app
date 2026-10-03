import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useRef, useState, type ReactNode } from 'react';
import { Pressable, TextInput, View, type LayoutChangeEvent } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ArrowUpIcon from '@/assets/icons/arrow-up.svg';
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import type { ChatMessage } from '@/types/chat';

/** 지도를 덜 가리도록 긴 답은 자른다. 전문은 캐릭터 머리 위 말풍선에 나온다. */
const MAX_LINES = { user: 3, assistant: 6 } as const;

interface Props {
  name: string;
  /** 최근 대화(오래된 것부터). 이 중 2쌍만 보인다. */
  messages: ChatMessage[];
  /** 답을 기다리는 질문. 있으면 입력을 막는다. */
  pendingMessage?: string;
  onSend: (message: string) => void;
  onClose: () => void;
  /**
   * 처음 그려졌을 때 한 번만, WebView 아래 끝에서 입력 바가 가리는 높이(아래 여백 포함)를 알린다.
   * 키보드나 입력으로 커질 때마다 알리면 지도가 계속 움직인다.
   */
  onFirstLayout?: (height: number) => void;
}

/**
 * 지도를 가리지 않도록 Modal이 아니라 지도 위에 띄운다. 대화는 상단 '<' 버튼 아래, 입력 바는 하단에 둔다.
 * 상단 '<' 버튼 말고도 빈 지도 탭(mapTap)·뒤로가기·탭 이동으로 닫힌다.
 * Modal로 띄우면 말풍선 연출이 딤에 가리고, 실패 토스트도 모달 아래에 깔린다.
 */
export default function ChatPanel({
  name,
  messages,
  pendingMessage,
  onSend,
  onClose,
  onFirstLayout,
}: Props) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const measured = useRef(false);

  const handleLayout = (event: LayoutChangeEvent) => {
    if (measured.current) return;
    measured.current = true;
    onFirstLayout?.(Math.ceil(event.nativeEvent.layout.height));
  };

  const isPending = pendingMessage !== undefined;
  // 기다리는 질문까지 합쳐 2쌍이 되게 한다.
  const visible = messages.slice(isPending ? -2 : -4);

  const trimmed = message.trim();
  const canSend = !isPending && trimmed !== '';

  const handleSend = () => {
    if (!canSend) return;
    onSend(trimmed);
    setMessage('');
  };

  // 서드파티 컴포넌트라 NativeWind className이 적용되지 않아 style을 쓴다.
  // box-none: 버튼·말풍선·입력 바 바깥의 터치는 지도로 넘긴다.
  return (
    <>
      {/* 지도는 상태바 영역까지 채우므로 safe area만큼 내린다. */}
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 top-0 gap-sm px-lg"
        style={{ paddingTop: insets.top + 12 }}
      >
        <BackPill label={`${name}와의 대화 나가기`} onPress={onClose}>
          <ChevronLeftIcon width={24} height={24} color={palette.gray[500]} />
          <Typography variant="h3" className="text-gray-800">
            {name}
          </Typography>
        </BackPill>

        {visible.map((item) => (
          <Bubble key={item.message_id} role={item.role} text={item.content} />
        ))}
        {isPending && (
          <>
            <Bubble role="user" text={pendingMessage} />
            <Bubble role="assistant" text="···" muted />
          </>
        )}
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
      >
        <View onLayout={handleLayout} pointerEvents="box-none" className="px-lg pb-lg">
          <View className="flex-row items-center gap-sm rounded-full bg-white py-xs pl-lg pr-xs shadow-md">
            <TextInput
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleSend}
              editable={!isPending}
              returnKeyType="send"
              placeholder={isPending ? '답을 기다리는 중이에요...' : `${name}에게 물어보기`}
              placeholderTextColor={palette.gray[400]}
              className="flex-1 py-sm font-sans text-sm text-gray-800"
            />
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              accessibilityLabel="보내기"
              className={`h-[36px] w-[36px] items-center justify-center rounded-full ${
                canSend ? 'bg-primary-600 active:bg-primary-700' : 'bg-gray-200'
              }`}
            >
              <ArrowUpIcon width={20} height={20} color="white" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

interface BubbleProps {
  role: ChatMessage['role'];
  text: string;
  muted?: boolean;
}

const Bubble = ({ role, text, muted }: BubbleProps) => {
  const isUser = role === 'user';
  return (
    <View
      className={`max-w-[80%] rounded-xl px-md py-sm shadow-md ${
        isUser ? 'self-end rounded-br-xs bg-primary-600' : 'self-start rounded-bl-xs bg-white'
      }`}
    >
      <Typography
        variant="body2"
        numberOfLines={MAX_LINES[role]}
        className={isUser ? 'text-white' : muted ? 'text-gray-400' : 'text-gray-800'}
      >
        {text}
      </Typography>
    </View>
  );
};

interface BackPillProps {
  label: string;
  onPress: () => void;
  children: ReactNode;
}

/** iOS 26에서는 리퀴드글래스, 글래스를 못 쓰는 플랫폼(Android·구버전 iOS)은 흰 알약으로 그린다. */
const BackPill = ({ label, onPress, children }: BackPillProps) => {
  const glass = isLiquidGlassAvailable();
  const content = (
    <View className="flex-row items-center gap-sm py-sm pl-sm pr-lg">{children}</View>
  );

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      // 글래스는 누름 효과를 isInteractive가 맡는다.
      className={`self-start ${glass ? '' : 'rounded-full bg-white shadow-md active:opacity-70'}`}
    >
      {glass ? (
        // 서드파티 컴포넌트라 NativeWind className이 적용되지 않아 style을 쓴다.
        <GlassView
          glassEffectStyle="regular"
          isInteractive
          style={{ borderRadius: 9999, overflow: 'hidden' }}
        >
          {content}
        </GlassView>
      ) : (
        content
      )}
    </Pressable>
  );
};
