import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import type { ShopItem } from '@/constants/market';

interface Props {
  items: ShopItem[];
  /** 현재 선택된 아이템 id. */
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const GRID_GAP = 8;
const COLUMNS = 3;

/**
 * 상점 아이템 3열 그리드. 테두리 카드 안에서 세로 스크롤한다.
 *
 * 선택 상태는 상위(화면)가 소유한다 — 선택 시 상단 미리보기가 함께 갱신되기 때문이다.
 * 캐릭터 꾸미기의 파츠 선택 그리드와 동일하게, 카드 폭을 측정해 칸 크기를 딱 맞춰
 * 남는 오른쪽 여백 없이 3열을 꽉 채운다.
 */
export default function ItemGrid({ items, selectedId, onSelect }: Props) {
  const [width, setWidth] = useState(0);
  // 소수 폭은 픽셀 반올림 시 합이 컨테이너를 넘어 마지막 칸이 밀릴 수 있으므로 내림한다.
  const itemSize = Math.floor((width - GRID_GAP * (COLUMNS - 1)) / COLUMNS);

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      contentContainerClassName="flex-row flex-wrap"
      contentContainerStyle={{ gap: GRID_GAP }}
    >
      {width > 0 &&
        items.map((item) => {
          const active = item.id === selectedId;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={{ width: itemSize, height: itemSize }}
              className={`items-center justify-center overflow-hidden rounded-lg bg-gray-100 ${
                active ? 'border-2 border-primary-600' : 'border border-white'
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
