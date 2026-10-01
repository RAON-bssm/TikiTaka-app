import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import CloseIcon from '@/assets/icons/close.svg';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';

interface Props {
  name: string;
  reply?: string;
  isPending: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
}

/**
 * 지도를 가리지 않도록 Modal이 아니라 화면 위에 겹쳐 띄운다.
 * Modal로 띄우면 말풍선 연출이 딤에 가리고, 실패 토스트도 모달 아래에 깔린다.
 */
export default function ChatPanel({ name, reply, isPending, onSend, onClose }: Props) {
  const [message, setMessage] = useState('');

  const trimmed = message.trim();
  const canSend = !isPending && trimmed !== '';

  const handleSend = () => {
    if (!canSend) return;
    onSend(trimmed);
    setMessage('');
  };

  // 서드파티 컴포넌트라 NativeWind className이 적용되지 않아 style을 쓴다.
  return (
    <KeyboardAvoidingView
      behavior="padding"
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
    >
      <View className="gap-md rounded-t-xl bg-white px-xl pb-lg pt-lg shadow-md">
        <View className="flex-row items-center justify-between">
          <Typography variant="h3" className="text-gray-800">
            {name}
          </Typography>
          <Pressable onPress={onClose} hitSlop={8}>
            <CloseIcon width={24} height={24} />
          </Pressable>
        </View>

        <Typography variant="body2" className={reply ? 'text-gray-700' : 'text-gray-400'}>
          {isPending
            ? '답을 기다리는 중이에요...'
            : (reply ?? `${name}에게 동네에 대해 물어보세요.`)}
        </Typography>

        <View className="flex-row items-center gap-sm">
          <TextInput
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            placeholder="메시지를 입력해주세요"
            placeholderTextColor={palette.gray[400]}
            className="flex-1 rounded-sm border border-gray-200 bg-white p-md font-sans text-sm text-gray-800 focus:border-gray-300"
          />
          <Button
            content="보내기"
            size="sm"
            className={canSend ? '' : 'opacity-50'}
            onclick={handleSend}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
