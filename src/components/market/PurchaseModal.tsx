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
  isPending: boolean;
  /** 토스트는 모달 아래에 깔려 보이지 않으므로 실패 사유는 창 안에 띄운다. */
  errorMessage?: string;
}

export default function PurchaseModal({
  visible,
  item,
  previewConfig,
  onClose,
  onConfirm,
  isPending,
  errorMessage,
}: Props) {
  if (!item) {
    return null;
  }

  // 요청 중에 닫으면 몇 초 뒤 결과 토스트만 뜬금없이 나타난다.
  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 items-center justify-center bg-black/20" onPress={handleClose}>
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

          {item.description && (
            <Typography variant="body3" className="text-center text-gray-400">
              {item.description}
            </Typography>
          )}

          {errorMessage && (
            <Typography variant="caption" className="text-center text-primary-600">
              {errorMessage}
            </Typography>
          )}

          <View className="w-full items-center gap-sm">
            <Button
              content={isPending ? '구매 중...' : '구매하기'}
              size="sm"
              className="w-full"
              disabled={isPending}
              onclick={onConfirm}
            />
            <Pressable
              onPress={handleClose}
              disabled={isPending}
              hitSlop={8}
              className="active:opacity-70"
            >
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
