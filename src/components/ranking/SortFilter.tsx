import { Pressable, View } from 'react-native';

import FilterIcon from '@/assets/icons/filter.svg';
import Typography from '@/components/ui/Typography';

const COLOR_GRAY = '#6E7D94'; // gray-500

interface Props<T extends string> {
  /** 정렬 옵션 목록. */
  sorts: readonly T[];
  /** 현재 선택된 정렬. */
  selected: T;
  onSelect: (sort: T) => void;
}

/** 필터 아이콘 + 정렬 옵션 칩 줄. */
export default function SortFilter<T extends string>({ sorts, selected, onSelect }: Props<T>) {
  return (
    <View className="flex-row items-center gap-xs">
      <View className="size-8 items-center justify-center rounded-full bg-gray-50">
        <FilterIcon width={20} height={20} color={COLOR_GRAY} />
      </View>
      {sorts.map((label) => {
        const active = label === selected;
        return (
          <Pressable
            key={label}
            onPress={() => onSelect(label)}
            className={`rounded-full px-lg py-sm ${active ? 'bg-primary-100' : 'bg-gray-50'}`}
          >
            <Typography variant="body3" className={active ? 'text-primary-600' : 'text-gray-500'}>
              {label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
