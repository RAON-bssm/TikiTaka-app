import { Modal, Pressable, View } from 'react-native';

import Character from '@/components/character/Character';
import Button from '@/components/ui/Button';
import PointBadge from '@/components/ui/PointBadge';
import Typography from '@/components/ui/Typography';
import type { CharacterConfig } from '@/constants/character/types';
import type { MarketItem } from '@/constants/market';

interface Props {
  visible: boolean;
  item: MarketItem | undefined;
  /** 내 캐릭터에 item의 파츠 하나만 얹은 구성. */
  previewConfig: CharacterConfig;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PurchaseModal({ visible, item, previewConfig, onClose, onConfirm }: Props) {
  if (!item) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/20" onPress={onClose}>
        {/* 빈 onPress로 탭을 삼켜 카드 안을 눌러도 닫히지 않게 한다 */}
        <Pressable
          onPress={() => {}}
          className="w-[240px] items-center gap-lg rounded-lg border border-gray-100 bg-white p-lg"
        >
          <Typography variant="h3" className="w-full text-center text-primary-600">
            {item.name}
          </Typography>

          <Character config={previewConfig} size={110} />

          <PointBadge point={item.price} />

          <Typography variant="body3" className="text-center text-gray-400">
            {item.description}
          </Typography>

          <View className="w-full items-center gap-sm">
            <Button content="구매하기" size="sm" className="w-full" onclick={onConfirm} />
            <Pressable onPress={onClose} className="active:opacity-70">
              <Typography variant="caption" className="text-xs text-gray-500 underline">
                돌아가기
              </Typography>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
