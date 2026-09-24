import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import Skeleton from '@/components/ui/feedback/Skeleton';
import type { MarketItem } from '@/constants/market';

interface Props {
  items: MarketItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

const GRID_GAP = 8;
const COLUMNS = 3;
const SKELETON_COUNT = 6;

/** 선택 상태는 상단 미리보기와 공유하므로 화면이 소유한다. */
export default function ItemGrid({ items, selectedId, onSelect, isLoading = false }: Props) {
  const [width, setWidth] = useState(0);
  // 소수 폭은 반올림 합이 넘쳐 마지막 칸이 밀리므로 내림하고, 남는 픽셀은 앞 열부터 1px씩 나눈다.
  const innerWidth = Math.floor(width - GRID_GAP * (COLUMNS - 1));
  const itemSize = Math.floor(innerWidth / COLUMNS);
  const remainder = innerWidth % COLUMNS;
  // 높이까지 다르면 행이 어긋나므로 나머지는 폭에만 더한다.
  const columnWidth = (index: number) => itemSize + (index % COLUMNS < remainder ? 1 : 0);

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      contentContainerClassName="flex-row flex-wrap"
      contentContainerStyle={{ gap: GRID_GAP }}
    >
      {width > 0 &&
        isLoading &&
        Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <View key={index} style={{ width: columnWidth(index), height: itemSize }}>
            <Skeleton className="h-full w-full rounded-lg" />
          </View>
        ))}

      {width > 0 &&
        !isLoading &&
        items.map((item, index) => {
          const active = item.id === selectedId;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={{ width: columnWidth(index), height: itemSize }}
              className={`items-center justify-center overflow-hidden rounded-lg bg-gray-100 ${
                active ? 'border-2 border-primary-600' : 'border border-white'
              }`}
            >
              {item.gridSource != null && (
                <Image
                  source={item.gridSource}
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
