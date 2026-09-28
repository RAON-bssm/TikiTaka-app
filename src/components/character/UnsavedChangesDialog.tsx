import { Modal, Pressable, View } from 'react-native';

import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';

interface Props {
  visible: boolean;
  /** 바깥을 누르거나 뒤로 가기를 누르면 화면에 남는다. */
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export default function UnsavedChangesDialog({ visible, onCancel, onDiscard, onSave }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable className="flex-1 items-center justify-center bg-black/40" onPress={onCancel}>
        <Pressable
          onPress={() => {}}
          className="w-[300px] gap-2xl rounded-xl bg-white px-xl pb-xl pt-2xl"
        >
          <View className="items-center gap-sm">
            <Typography variant="h2" className="text-gray-800">
              변경사항을 저장할까요?
            </Typography>
            <Typography variant="body2" className="text-center text-gray-500">
              저장하지 않으면 바꾼 캐릭터가 사라져요.
            </Typography>
          </View>
          <View className="flex-row gap-sm">
            <Button content="저장 안 함" variant="light" className="flex-1" onclick={onDiscard} />
            <Button content="저장하기" className="flex-1" onclick={onSave} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
