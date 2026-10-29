import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

import Character from '@/components/character/Character';
import TypingDots from '@/components/chat/TypingDots';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';

const CHARACTER_SIZE = 160;
const HOP_PX = 24;
const HOP_CYCLE_MS = 1000;
/** 한 바퀴(0~1) 중 공중에 떠 있는 구간. 나머지는 착지·도약 준비로 땅에 붙어 있다. */
const TAKEOFF = 0.15;
const LANDING = 0.85;
const SQUASH = 0.9;
const STRETCH = 1.06;
const GRID_PX = 32;
const BUBBLE_SHADOW = `0px 4px 16px ${palette.gray[800]}1F`;

export default function MapLoading() {
  const { config, isLoaded } = useCharacterConfig();
  const reduceMotion = useReducedMotion();
  const cycle = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    // 높이·찌그러짐을 한 진행값에서 계산해야 착지 순간과 찌그러지는 순간이 어긋나지 않는다.
    cycle.value = withRepeat(withTiming(1, { duration: HOP_CYCLE_MS, easing: Easing.linear }), -1);
  }, [cycle, reduceMotion]);

  const characterStyle = useAnimatedStyle(() => {
    const t = cycle.value;
    const air = Math.min(Math.max((t - TAKEOFF) / (LANDING - TAKEOFF), 0), 1);
    const height = 4 * air * (1 - air);
    const scaleY = interpolate(t, [0, TAKEOFF, 0.5, LANDING, 1], [SQUASH, STRETCH, 1, 1, SQUASH]);
    return {
      transform: [{ translateY: -height * HOP_PX }, { scaleX: 2 - scaleY }, { scaleY }],
    };
  });
  const shadowStyle = useAnimatedStyle(() => {
    const air = Math.min(Math.max((cycle.value - TAKEOFF) / (LANDING - TAKEOFF), 0), 1);
    const height = 4 * air * (1 - air);
    return {
      opacity: interpolate(height, [0, 1], [0.5, 0.2]),
      transform: [{ scaleX: interpolate(height, [0, 1], [1, 0.6]) }],
    };
  });

  return (
    <Animated.View
      exiting={FadeOut.duration(300)}
      className="absolute inset-0 items-center justify-center bg-gray-50"
    >
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="grid" width={GRID_PX} height={GRID_PX} patternUnits="userSpaceOnUse">
            <Path
              d={`M ${GRID_PX} 0 L 0 0 0 ${GRID_PX}`}
              fill="none"
              stroke={palette.primary[300]}
              strokeWidth={1}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grid)" />
      </Svg>

      <View className="items-center gap-3xl">
        <View className="items-center">
          <View
            className="flex-row items-center gap-sm rounded-lg bg-white px-lg py-md"
            style={{ boxShadow: BUBBLE_SHADOW }}
          >
            <Typography variant="body3" className="text-gray-600">
              동네 지도 펼치는 중
            </Typography>
            <TypingDots />
          </View>
          <View className="-mt-xs h-[12px] w-[12px] rotate-45 bg-white" />
        </View>

        <View className="items-center">
          <Animated.View
            style={[
              { width: CHARACTER_SIZE, height: CHARACTER_SIZE, transformOrigin: 'bottom' },
              characterStyle,
            ]}
          >
            {isLoaded && <Character config={config} size={CHARACTER_SIZE} />}
          </Animated.View>
          <Animated.View
            className="h-[12px] w-[96px] rounded-full bg-gray-300"
            style={shadowStyle}
          />
        </View>
      </View>
    </Animated.View>
  );
}
