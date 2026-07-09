import { Pressable, View } from 'react-native';

import Typography from '@/components/ui/Typography';

interface Props<T extends string> {
  /** 탭 라벨 목록. */
  tabs: readonly T[];
  /** 현재 선택된 탭. */
  selected: T;
  onSelect: (tab: T) => void;
}

/** 밑줄 강조 방식의 랭킹 종류 탭 (동네/개인). */
export default function RankingTabs<T extends string>({ tabs, selected, onSelect }: Props<T>) {
  return (
    <View className="flex-row">
      {tabs.map((label) => {
        const active = label === selected;
        return (
          <Pressable
            key={label}
            onPress={() => onSelect(label)}
            className={`items-center justify-center p-sm ${
              active ? 'border-b border-primary-600' : ''
            }`}
          >
            <Typography variant="h3" className={active ? 'text-gray-700' : 'text-gray-400'}>
              {label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
