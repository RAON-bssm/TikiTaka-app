import { Image } from 'expo-image';
import { Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import type { ShopItem } from '@/constants/market';

interface Props {
  items: ShopItem[];
  /** 현재 선택된 아이템 id. */
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * 상점 아이템 3열 그리드. 테두리 카드 안에서 세로 스크롤한다.
 *
 * 선택 상태는 상위(화면)가 소유한다 — 선택 시 상단 미리보기가 함께 갱신되기 때문이다.
 * 캐릭터 꾸미기의 파츠 선택 그리드와 동일한 3열 레이아웃을 따른다.
 */
export default function ItemGrid({ items, selectedId, onSelect }: Props) {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="flex-row flex-wrap gap-sm"
    >
      {items.map((item) => {
        const active = item.id === selectedId;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            className={`aspect-square basis-[30%] items-center justify-center overflow-hidden rounded-lg bg-gray-200 ${
              active ? 'border-2 border-primary-600' : 'border border-gray-50'
            }`}
          >
            {item.source != null && (
              <Image
                source={item.source}
                contentFit="contain"
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
