import { Pressable, View } from 'react-native';

import Typography from '@/components/ui/Typography';

interface Props<T extends string> {
  tabs: readonly T[];
  selected: T;
  onSelect: (tab: T) => void;
}

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
