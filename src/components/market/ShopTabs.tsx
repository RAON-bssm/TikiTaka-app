import { Pressable, View } from 'react-native';

import Typography from '@/components/ui/Typography';

interface Props<T extends string> {
  /** 탭 라벨 목록. */
  tabs: readonly T[];
  /** 현재 선택된 탭. */
  selected: T;
  onSelect: (tab: T) => void;
}

/** 상점 상단 섹션 탭 (상점/뽑기) — 밑줄 강조, 선택된 탭이 더 크게 표시된다. */
export default function ShopTabs<T extends string>({ tabs, selected, onSelect }: Props<T>) {
  return (
    <View className="flex-row items-center gap-sm">
      {tabs.map((label) => {
        const active = label === selected;
        return (
          <Pressable
            key={label}
            onPress={() => onSelect(label)}
            // 선택 탭만 primary 밑줄. 비활성도 투명 테두리를 둬 높이를 맞춘다 (랭킹 탭과 동일한 강조)
            className={`items-center justify-center border-b-2 p-xs ${
              active ? 'border-primary-600' : 'border-transparent'
            }`}
          >
            <Typography variant={active ? 'h2' : 'body1'} className="text-gray-900">
              {label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
