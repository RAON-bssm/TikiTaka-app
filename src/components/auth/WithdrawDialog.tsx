import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, View } from 'react-native';

import { getApiErrorMessage } from '@/api/error';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/input/TextInput';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useWithdraw } from '@/hooks/auth/useWithdraw';

interface Props {
  visible: boolean;
  /** 실수로 탈퇴하지 않도록 이 이름을 똑같이 입력해야 탈퇴 버튼이 눌린다. */
  userName: string;
  onClose: () => void;
}

export default function WithdrawDialog({ visible, userName, onClose }: Props) {
  const { showToast } = useToast();
  const { mutate: withdraw, isPending } = useWithdraw();
  const [confirmName, setConfirmName] = useState('');
  // 앞뒤 공백은 실수로 들어가기 쉬워 무시하고, 나머지는 정확히 같아야 한다.
  const isConfirmed = confirmName.trim() === userName;

  const handleClose = () => {
    if (isPending) return;
    // 다시 열었을 때 이전 입력이 남아 있으면 확인 절차가 무의미해진다.
    setConfirmName('');
    onClose();
  };

  const handleWithdraw = () => {
    if (!isConfirmed || isPending) return;

    // 성공하면 useWithdraw가 토스트를 띄우고 로그인 화면으로 보낸다.
    withdraw(undefined, {
      onError: (error) => showToast(getApiErrorMessage(error, '탈퇴하지 못했어요')),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* 입력칸이 있어 키보드가 팝업을 가리지 않도록 밀어 올린다 */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <Pressable className="flex-1 items-center justify-center bg-black/40" onPress={handleClose}>
          <Pressable
            onPress={() => {}}
            className="w-[300px] gap-2xl rounded-xl bg-white px-xl pb-xl pt-2xl"
          >
            <View className="items-center gap-sm">
              <Typography variant="h2" className="text-gray-800">
                정말 탈퇴할까요?
              </Typography>
              <Typography variant="body2" className="text-center text-gray-500">
                포인트와 아이템은 되돌릴 수 없고, 작성한 게시물은 “탈퇴한 사용자”로 남아요.
              </Typography>
            </View>

            <View className="gap-sm">
              <Typography variant="body2" className="text-gray-600">
                확인을 위해{' '}
                <Typography variant="body2" className="font-bold text-gray-800">
                  {userName}
                </Typography>
                을(를) 입력해주세요.
              </Typography>
              <TextInput
                value={confirmName}
                onChangeText={setConfirmName}
                placeholder={userName}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="flex-row gap-sm">
              <Button content="취소" variant="light" className="flex-1" onclick={handleClose} />
              <Button
                content={isPending ? '탈퇴 중...' : '탈퇴하기'}
                className={`flex-1 ${!isConfirmed || isPending ? 'opacity-50' : ''}`}
                onclick={handleWithdraw}
              />
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
