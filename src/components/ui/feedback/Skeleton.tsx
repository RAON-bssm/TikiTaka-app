import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { palette } from '@/constants/colors';

interface Props {
  /** 크기·모양. 예: "h-5 w-24 rounded-full" */
  className?: string;
}

const HIGHLIGHT = palette.gray[50];
const SHIMMER_COLORS = [`${HIGHLIGHT}00`, HIGHLIGHT, `${HIGHLIGHT}00`] as const;
const SWEEP_MS = 1100;
const REST_MS = 400;

export default function Skeleton({ className = '' }: Props) {
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || width === 0) return;
    sweep.value = withRepeat(
      withDelay(REST_MS, withTiming(1, { duration: SWEEP_MS, easing: Easing.inOut(Easing.ease) })),
      -1,
    );
  }, [sweep, width, reduceMotion]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (sweep.value * 2 - 1) * width }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View onLayout={handleLayout} className={`overflow-hidden bg-gray-100 ${className}`}>
      {width > 0 && !reduceMotion ? (
        <Animated.View style={[StyleSheet.absoluteFill, bandStyle]}>
          <LinearGradient
            colors={SHIMMER_COLORS}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
