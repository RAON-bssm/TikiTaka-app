import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import Typography from '@/components/ui/Typography';
import type { Stage } from '@/types/match';

interface Props {
  stage?: Stage;
}

const RIPPLE_SCALE = 2.6;
const RIPPLE_DURATION = 1800;
const RIPPLE_OPACITY = 0.5;

const PulsingDot = () => {
  const progress = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: RIPPLE_DURATION, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [progress, reduceMotion]);

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * (RIPPLE_SCALE - 1) }],
    opacity: RIPPLE_OPACITY * (1 - progress.value),
  }));

  return (
    <View className="h-md w-md items-center justify-center">
      {!reduceMotion && (
        <Animated.View
          style={rippleStyle}
          className="absolute h-md w-md rounded-full bg-primary-600"
        />
      )}
      <View className="h-md w-md rounded-full bg-primary-600" />
    </View>
  );
};

export default function StageBadge({ stage }: Props) {
  if (!stage) {
    return null;
  }

  return (
    <View className="w-full flex-row items-center gap-md rounded-full border border-gray-200 bg-white px-lg py-sm">
      <PulsingDot />
      <Typography variant="h4" className="text-primary-600">
        시즌 {stage.season}
      </Typography>
      <View className="h-md border-l border-primary-300" />
      <Typography variant="body3" className="flex-1 text-center text-gray-700">
        {stage.round}라운드 집계 중
      </Typography>
    </View>
  );
}
