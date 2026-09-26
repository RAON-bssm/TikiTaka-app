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
  /** 크기·모양. 예: "h-5 w-24 rounded-full" */
  className?: string;
}

const COLOR_FROM = palette.gray[100];
const COLOR_TO = palette.gray[200];

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
