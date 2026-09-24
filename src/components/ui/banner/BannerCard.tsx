import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import Character from '@/components/character/Character';
import type { BannerSlide } from '@/constants/banner';
import Typography from '../Typography';

// Figma의 방사형 그라디언트를 가로 선형으로 근사했다.
const GRADIENT_COLORS = ['#FFFFFF', '#FFFFFF', '#FCE0D5', '#F8C1AC', '#F5A282', '#F18358'] as const;
const GRADIENT_LOCATIONS = [0, 0.37, 0.52, 0.68, 0.84, 1] as const;

interface Props {
  slide: BannerSlide;
}

export default function BannerCard({ slide }: Props) {
  return (
    <View className="overflow-hidden rounded-md">
      <LinearGradient
        colors={GRADIENT_COLORS}
        locations={GRADIENT_LOCATIONS}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="flex-row items-center justify-between px-xl py-2xl">
        <View className="gap-sm">
          <Typography variant="body3" className="text-primary-600">
            {slide.eyebrow}
          </Typography>
          <View>
            {slide.title.map((line, lineIndex) => (
              <Typography key={lineIndex} variant="h1" className="text-gray-700">
                {line.map((segment, segmentIndex) => (
                  <Typography
                    key={segmentIndex}
                    variant="h1"
                    className={segment.highlight ? 'text-primary-600' : 'text-gray-700'}
                  >
                    {segment.text}
                  </Typography>
                ))}
              </Typography>
            ))}
          </View>
        </View>
        <Character config={slide.character} size={110} />
      </View>
    </View>
  );
}
