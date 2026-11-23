import { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** 닫힘 애니메이션이 끝난 뒤 호출된다(iOS 전용, RN Modal 제약). */
  onDismiss?: () => void;
  children: ReactNode;
}

export default function BottomSheet({ visible, onClose, onDismiss, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onDismiss={onDismiss}
    >
      <Pressable className="flex-1 bg-black/25" onPress={onClose} />

      <View
        className="absolute bottom-0 w-full rounded-t-lg bg-white px-xl pt-md"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="mb-lg h-[8px] w-[35px] self-center rounded-full bg-gray-200" />
        {children}
      </View>
    </Modal>
  );
}
