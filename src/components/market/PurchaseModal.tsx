import { Modal, Pressable, View } from 'react-native';

import Character from '@/components/character/Character';
import Button from '@/components/ui/Button';
import PointBadge from '@/components/ui/PointBadge';
import Typography from '@/components/ui/Typography';
import type { ShopItem } from '@/constants/market';

interface Props {
  visible: boolean;
  /** 구매 대상 아이템. */
  item: ShopItem;
  onClose: () => void;
  onConfirm: () => void;
}

/** 아이템 구매 확인 모달 — 중앙 팝업(캐릭터 미리보기 + 가격 + 구매/돌아가기). */
export default function PurchaseModal({ visible, item, onClose, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* 딤 처리된 배경 - 탭하면 닫힘 */}
      <Pressable className="flex-1 items-center justify-center bg-black/20" onPress={onClose}>
        {/* 카드 - 내부 탭은 배경으로 전달하지 않아 닫히지 않는다 */}
        <Pressable
          onPress={() => {}}
          className="w-[240px] items-center gap-lg rounded-lg border border-gray-100 bg-white p-lg"
        >
          <Typography variant="h3" className="w-full text-center text-primary-600">
            {item.name}
          </Typography>

          <Character config={item.character} size={110} />

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
