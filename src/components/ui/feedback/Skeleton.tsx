import { palette } from '@/constants/colors';
import { useEffect } from 'react';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  /** 크기·모양을 NativeWind 클래스로 지정한다. 예: "h-5 w-24 rounded-full" */
  className?: string;
}

// 뼈대가 오갈 두 회색. 밝은쪽 → 진한쪽으로 반복하며 색이 또렷하게 바뀐다.
const COLOR_FROM = palette.gray[100];
const COLOR_TO = palette.gray[200];

/**
 * 로딩 중 콘텐츠 자리를 대신하는 뼈대 블록.
 *
 * 배경색이 gray-200 ↔ gray-300 사이를 반복하며 또렷하게 깜빡인다(color pulse).
 * 크기·모양은 className 으로 자유롭게 지정한다.
 */
export default function Skeleton({ className = '' }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [COLOR_FROM, COLOR_TO]),
  }));

  return <Animated.View style={animatedStyle} className={className} />;
}
