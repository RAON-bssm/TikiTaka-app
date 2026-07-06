import { Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import Typography from '@/components/ui/Typography';

interface Props<T extends string> {
  /** 탭 라벨 목록. */
  tabs: readonly T[];
  /** 현재 선택된 탭. */
  selected: T;
  onSelect: (tab: T) => void;
}

/**
 * 상단이 둥근 알약형 카테고리 탭 줄 (가로 스크롤).
 *
 * 아래에 붙는 테두리 카드와 시각적으로 이어지는 형태로, 캐릭터 꾸미기·상점에서 공용으로 쓴다.
 * 선택된 탭은 주황 배경, 나머지는 연한 파랑 배경으로 표시한다.
 */
export default function CategoryTabs<T extends string>({ tabs, selected, onSelect }: Props<T>) {
  return (
    // 탭 줄은 내용 높이만 차지하고, 남는 높이는 아래 카드가 모두 채운다
    <View className="shrink-0">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-sm"
      >
        {tabs.map((label) => {
          const active = label === selected;
          return (
            <Pressable
              key={label}
              onPress={() => onSelect(label)}
              className={`w-[60px] items-center rounded-t-lg py-sm ${
                active ? 'bg-primary-600' : 'bg-secondary-100'
              }`}
            >
              <Typography
                variant={active ? 'h4' : 'body3'}
                className={active ? 'text-gray-50' : 'text-primary-600'}
              >
                {label}
              </Typography>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
