import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import Character from '@/components/character/Character';
import type { BannerSlide } from '@/constants/banner';
import Typography from '../Typography';

/**
 * 배너 카드 배경 그라디언트.
 * Figma의 방사형(우측 primary → 좌측 white)을 가로 선형 그라디언트로 근사했다.
 * 색/정지점만 바꾸면 다른 톤의 배너도 만들 수 있다.
 */
const GRADIENT_COLORS = ['#FFFFFF', '#FFFFFF', '#FCE0D5', '#F8C1AC', '#F5A282', '#F18358'] as const;
const GRADIENT_LOCATIONS = [0, 0.37, 0.52, 0.68, 0.84, 1] as const;

interface Props {
  slide: BannerSlide;
}

/** 배너 슬라이드 한 장을 그린다. 캐러셀 여부와 무관하게 독립적으로 재사용 가능. */
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
        <View className="gap-[10px]">
          <Typography variant="body3" className="text-primary-600">
            {slide.eyebrow}
          </Typography>
          <View>
            {slide.title.map((line, lineIndex) => (
              <Typography key={lineIndex} variant="h1" className="text-gray-800">
                {line.map((segment, segmentIndex) => (
                  <Typography
                    key={segmentIndex}
                    variant="h1"
                    className={segment.highlight ? 'text-primary-600' : 'text-gray-800'}
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
