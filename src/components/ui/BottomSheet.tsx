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
      {/* 딤 처리된 배경 - 탭하면 닫힘 */}
      <Pressable className="flex-1 bg-black/25" onPress={onClose} />

      {/* 하단 시트 본문 - 하단 safe area 만큼 위로 올림 */}
      <View
        className="absolute bottom-0 w-full rounded-t-lg bg-white px-xl pt-md"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* 드래그 핸들 */}
        <View className="mb-lg h-[8px] w-[35px] self-center rounded-full bg-gray-200" />
        {children}
      </View>
    </Modal>
  );
}
