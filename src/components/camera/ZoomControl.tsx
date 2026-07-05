import GlassCircle from '@/components/ui/GlassCircle';
import { Pressable, Text, View } from 'react-native';

export interface ZoomLevel {
  label: string;
  /** neutralZoom(1x) 기준 배율. 0.5는 초광각(minZoom) 렌즈로 매핑됩니다. */
  factor: number;
}

export const ZOOM_LEVELS: ZoomLevel[] = [
  { label: '.5', factor: 0.5 },
  { label: '1', factor: 1 },
  { label: '2', factor: 2 },
  { label: '3', factor: 3 },
];

interface Props {
  selected: string;
  onSelect: (level: ZoomLevel) => void;
  /** 노출할 배율 목록. 기기에 초광각이 없으면 부모가 .5를 빼고 넘겨줍니다. */
  levels?: ZoomLevel[];
}

export default function ZoomControl({ selected, onSelect, levels = ZOOM_LEVELS }: Props) {
  return (
    <View className="flex flex-row items-center justify-center gap-2xl">
      {levels.map((level) => {
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
