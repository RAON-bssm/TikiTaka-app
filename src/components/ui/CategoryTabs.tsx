import { Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import Typography from '@/components/ui/Typography';

interface Props<T extends string> {
  tabs: readonly T[];
  selected: T;
  onSelect: (tab: T) => void;
}

/** 아래에 붙는 테두리 카드와 이어지는 탭 줄. 캐릭터 꾸미기·상점 공용. */
export default function CategoryTabs<T extends string>({ tabs, selected, onSelect }: Props<T>) {
  return (
    // shrink-0: 탭 줄은 내용 높이만 차지하고 남는 높이는 아래 카드가 채운다
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
                className={active ? 'text-white' : 'text-primary-600'}
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
