import { View } from 'react-native';

import Character from '@/components/character/Character';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import type { CharacterConfig } from '@/constants/character/types';

interface Props {
  /** 미리보기로 합성해 보여줄 캐릭터 구성. */
  character: CharacterConfig;
  name: string;
  description: string;
  /** 구매에 필요한 포인트. */
  price: number;
  onBuy?: () => void;
}

/** 추천/선택된 꾸미기 아이템 미리보기 — 캐릭터 + 아이템 정보 + 구매 버튼. */
export default function FeaturedItem({ character, name, description, price, onBuy }: Props) {
  return (
    <View className="w-full flex-row items-center justify-between">
      <View className="w-[110px] items-center">
        <Character config={character} size={110} />
      </View>

      <View className="w-[150px] gap-md">
        <View className="gap-md rounded-md bg-secondary-100 p-md">
          <Typography variant="h4" className="text-secondary-500">
            {name}
          </Typography>
          <Typography variant="body3" className="text-gray-700">
            {description}
          </Typography>
        </View>
        <Button content={`${price} 포인트`} size="sm" onclick={onBuy} />
      </View>
    </View>
  );
}
