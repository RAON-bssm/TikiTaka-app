import { Modal, Pressable, View } from 'react-native';

import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useLogout } from '@/hooks/auth/useLogout';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function LogoutDialog({ visible, onClose }: Props) {
  // 실패해도 로컬 정리 후 로그인 화면으로 가므로(useLogout) 에러 처리가 따로 없다.
  const { mutate: logout, isPending } = useLogout();

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleLogout = () => {
    if (isPending) return;
    logout();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 items-center justify-center bg-black/40" onPress={handleClose}>
        <Pressable
          onPress={() => {}}
          className="w-[300px] gap-2xl rounded-xl bg-white px-xl pb-xl pt-2xl"
        >
          <View className="items-center gap-sm">
            <Typography variant="h2" className="text-gray-800">
              로그아웃할까요?
            </Typography>
            <Typography variant="body2" className="text-center text-gray-500">
              다시 로그인하면 그대로 이어서 할 수 있어요.
            </Typography>
          </View>
          <View className="flex-row gap-sm">
            <Button content="취소" variant="light" className="flex-1" onclick={handleClose} />
            <Button
              content={isPending ? '로그아웃 중...' : '로그아웃'}
              className={`flex-1 ${isPending ? 'opacity-50' : ''}`}
              onclick={handleLogout}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
