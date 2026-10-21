import { Modal, Pressable, View } from 'react-native';

import { getApiErrorMessage } from '@/api/error';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useBlockUser } from '@/hooks/block/useBlockUser';

interface Props {
  target?: { userId: string; userName: string };
  onClose: () => void;
  /** 차단 성공 후 추가 동작 (예: 상세 화면이면 404가 되니 목록으로 돌아가기). */
  onBlocked?: () => void;
}

export default function BlockUserDialog({ target, onClose, onBlocked }: Props) {
  const { showToast } = useToast();
  const { mutate: blockUser, isPending } = useBlockUser();

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleBlock = () => {
    if (!target || isPending) return;

    blockUser(target.userId, {
      onSuccess: () => {
        showToast(`${target.userName}님을 차단했어요`);
        onClose();
        onBlocked?.();
      },
      onError: (error) => showToast(getApiErrorMessage(error, '차단하지 못했어요')),
    });
  };

  return (
    <Modal
      visible={!!target}
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
              {target?.userName}님을 차단할까요?
            </Typography>
            <Typography variant="body2" className="text-center text-gray-500">
              차단하면 이 유저의 게시물과 순위가 더 이상 보이지 않아요.
            </Typography>
          </View>
          <View className="flex-row gap-sm">
            <Button content="취소" variant="light" className="flex-1" onclick={handleClose} />
            <Button
              content={isPending ? '차단 중...' : '차단하기'}
              className={`flex-1 ${isPending ? 'opacity-50' : ''}`}
              onclick={handleBlock}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
