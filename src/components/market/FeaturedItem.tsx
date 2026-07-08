import { View } from 'react-native';

import Character from '@/components/character/Character';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import type { ShopItem } from '@/constants/market';

interface Props {
  /** 미리보기로 노출할 아이템. */
  item: ShopItem;
  onBuy?: () => void;
}

/** 추천/선택된 꾸미기 아이템 미리보기 — 캐릭터 + 아이템 정보 + 구매 버튼. */
export default function FeaturedItem({ item, onBuy }: Props) {
  return (
    <View className="w-full flex-row items-center justify-between">
      <View className="w-[110px] items-center">
        <Character config={item.character} size={110} />
      </View>

      <View className="w-[150px] gap-md">
        <View className="gap-md rounded-md bg-secondary-100 p-md">
          <Typography variant="h4" className="text-secondary-500">
            {item.name}
          </Typography>
          <Typography variant="body3" className="text-gray-600">
            {item.description}
          </Typography>
        </View>
        <Button content={`${item.price} 포인트`} size="sm" onclick={onBuy} />
      </View>
    </View>
  );
}
