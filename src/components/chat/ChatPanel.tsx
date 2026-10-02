import { useRef, useState } from 'react';
import { Pressable, TextInput, View, type LayoutChangeEvent } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import ArrowUpIcon from '@/assets/icons/arrow-up.svg';
import { palette } from '@/constants/colors';

interface Props {
  name: string;
  isPending: boolean;
  onSend: (message: string) => void;
  /**
   * 처음 그려졌을 때 한 번만, WebView 아래 끝에서 가려지는 높이(아래 여백 포함)를 알린다.
   * 키보드나 입력으로 커질 때마다 알리면 지도가 계속 움직인다.
   */
  onFirstLayout?: (height: number) => void;
}

/**
 * 지도를 가리지 않도록 Modal이 아니라 지도 위에 입력 바만 띄운다. 답은 지도 말풍선으로만 보여 준다.
 * 닫기 버튼이 없다. 빈 지도 탭(mapTap)·뒤로가기·탭 이동으로 닫는다.
 * Modal로 띄우면 말풍선 연출이 딤에 가리고, 실패 토스트도 모달 아래에 깔린다.
 */
export default function ChatPanel({ name, isPending, onSend, onFirstLayout }: Props) {
  const [message, setMessage] = useState('');
  const measured = useRef(false);

  const handleLayout = (event: LayoutChangeEvent) => {
    if (measured.current) return;
    measured.current = true;
    onFirstLayout?.(Math.ceil(event.nativeEvent.layout.height));
  };

  const trimmed = message.trim();
  const canSend = !isPending && trimmed !== '';

  const handleSend = () => {
    if (!canSend) return;
    onSend(trimmed);
    setMessage('');
  };

  // 서드파티 컴포넌트라 NativeWind className이 적용되지 않아 style을 쓴다.
  // box-none: 바 양옆·아래 여백의 터치는 지도로 넘긴다.
  return (
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
  );
}
