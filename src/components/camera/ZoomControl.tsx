import GlassCircle from '@/components/ui/GlassCircle';
import { Pressable, Text, View } from 'react-native';

export interface ZoomLevel {
  label: string;
  /** expo-camera의 zoom prop 값 (0~1). 광학 배율이 아닌 정규화 값이라 근사치입니다. */
  value: number;
}

export const ZOOM_LEVELS: ZoomLevel[] = [
  { label: '.5', value: 0 },
  { label: '1', value: 0 },
  { label: '2', value: 0.2 },
  { label: '3', value: 0.4 },
];

interface Props {
  selected: string;
  onSelect: (level: ZoomLevel) => void;
}

export default function ZoomControl({ selected, onSelect }: Props) {
  return (
    <View className="flex flex-row items-center justify-center gap-2xl">
      {ZOOM_LEVELS.map((level) => {
        const isActive = level.label === selected;
        return (
          <Pressable key={level.label} onPress={() => onSelect(level)} hitSlop={8}>
            <GlassCircle size={32}>
              <Text
                className={`font-medium text-md text-center leading-none ${
                  isActive ? 'text-primary-600' : 'text-white'
                }`}
                style={{ includeFontPadding: false, textAlignVertical: 'center' }}
              >
                {level.label}
              </Text>
            </GlassCircle>
          </Pressable>
        );
      })}
    </View>
  );
}
