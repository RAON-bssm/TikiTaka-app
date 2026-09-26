import { View } from 'react-native';

import Character from '@/components/character/Character';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import type { CharacterConfig } from '@/constants/character/types';
import type { MarketItem } from '@/constants/market';

interface Props {
  item: MarketItem | undefined;
  /** 내 캐릭터에 item의 파츠 하나만 얹은 구성. */
  previewConfig: CharacterConfig;
  onBuy?: () => void;
  onCustomize?: () => void;
}

export default function FeaturedItem({ item, previewConfig, onBuy, onCustomize }: Props) {
  if (!item) {
    return (
      <View className="w-full items-center py-lg">
        <Typography variant="body2" className="text-gray-400">
          이 카테고리엔 살 수 있는 아이템이 없어요.
        </Typography>
      </View>
    );
  }

  return (
    <View className="w-full flex-row items-center justify-between">
      <View className="w-[110px] items-center">
        <Character config={previewConfig} size={110} />
      </View>

      <View className="w-[150px] gap-md">
        <View className="gap-md rounded-md bg-secondary-100 p-md">
          <Typography variant="h4" className="text-secondary-500">
            {item.name}
          </Typography>
          <Typography variant="body3" className="text-gray-600">
            {item.description}
          </Typography>
          <Typography variant="h4" className="text-secondary-500">
            {item.price} 포인트
          </Typography>
        </View>
        <View className="flex-row gap-sm">
          <Button content="구매" size="sm" className="flex-1" onclick={onBuy} />
          <Button
            content="옷장"
            size="sm"
            variant="light"
            className="flex-1"
            onclick={onCustomize}
          />
        </View>
      </View>
    </View>
  );
}
