import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import Typography from '@/components/ui/Typography';
import { TILT } from './tilt';

// banner-shape-star.svg와 같은 모양이다. 그 파일은 주황 채움이 박혀 있어 파란 배경에 쓸 수 없어 직접 그린다.
const STAR_PATH =
  'M42.6554 0L52.0688 33.7882L85.3236 25.2458L61.4822 50.4786L85.3236 75.7244L52.0688 67.1821L42.6554 100.957L33.2548 67.1821L0 75.7244L23.8414 50.4786L0 25.2458L33.2548 33.7882L42.6554 0Z';
const STAR_VIEWBOX = '0 0 85.3236 100.957';

const TONE_CLASS = {
  me: { bg: 'bg-primary-600', tagText: 'text-primary-600' },
  rival: { bg: 'bg-secondary-500', tagText: 'text-secondary-500' },
} as const;

interface Props {
  tag: string;
  title: string;
  subtitle?: string;
  tone: 'me' | 'rival';
}

export default function ResultHero({ tag, title, subtitle, tone }: Props) {
  const color = TONE_CLASS[tone];
  return (
    <View className={`gap-md overflow-hidden rounded-xl p-2xl ${color.bg}`}>
      <View pointerEvents="none" style={styles.bigStar}>
        <Svg width="100%" height="100%" viewBox={STAR_VIEWBOX}>
          <Path d={STAR_PATH} fill="white" fillOpacity={0.18} />
        </Svg>
      </View>
      <View pointerEvents="none" style={styles.smallStar}>
        <Svg width="100%" height="100%" viewBox={STAR_VIEWBOX}>
          <Path d={STAR_PATH} fill="white" fillOpacity={0.3} />
        </Svg>
      </View>

      <View className="self-start rounded-sm bg-white px-md py-xs" style={TILT.left}>
        <Text className={`font-title text-md ${color.tagText}`}>{tag}</Text>
      </View>
      <Text className="font-title text-3xl text-white">{title}</Text>
      {subtitle && (
        <Typography variant="body3" className="text-white/80">
          {subtitle}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bigStar: {
    position: 'absolute',
    right: -24,
    top: -20,
    width: 120,
    height: 142,
    transform: [{ rotate: '-18deg' }],
  },
  smallStar: {
    position: 'absolute',
    right: 96,
    bottom: -14,
    width: 40,
    height: 47,
    transform: [{ rotate: '14deg' }],
  },
});
