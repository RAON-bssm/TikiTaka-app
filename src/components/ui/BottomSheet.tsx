import { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function BottomSheet({ visible, onClose, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
