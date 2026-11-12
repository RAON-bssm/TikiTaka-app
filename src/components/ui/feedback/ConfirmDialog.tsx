import { Modal, Pressable, View } from 'react-native';

import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';

interface Props {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  /** 바깥·뒤로 가기·취소 버튼 모두 이것으로 닫는다. */
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: Props) {
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
            <Typography variant="h2" className="text-center text-gray-800">
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" className="text-center text-gray-500">
                {description}
              </Typography>
            )}
          </View>
          <View className="flex-row gap-sm">
            <Button content={cancelLabel} variant="light" className="flex-1" onclick={onCancel} />
            <Button content={confirmLabel} className="flex-1" onclick={onConfirm} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
