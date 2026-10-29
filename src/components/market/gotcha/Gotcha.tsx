import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  BounceIn,
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import Character from '@/components/character/Character';
import Typography from '@/components/ui/Typography';
import type { GotchaPull } from '@/constants/market';

// RN Text에는 text-stroke가 없어, 같은 글자를 4방향으로 1px씩 밀어 겹쳐 외곽선처럼 보이게 한다.
const OUTLINE_OFFSETS = [
  { width: 0, height: -1 },
  { width: 0, height: 1 },
  { width: -1, height: 0 },
  { width: 1, height: 0 },
] as const;

/** 밝은 글로우 위에서도 이름이 보이도록 외곽선을 두른다. */
function OutlinedItemName({ name }: { name: string }) {
  return (
    <View className="z-10 mb-sm">
      {OUTLINE_OFFSETS.map((offset, i) => (
        <Text
          key={i}
          aria-hidden
          className="absolute font-title text-xl text-gray-800"
          style={{ transform: [{ translateX: offset.width }, { translateY: offset.height }] }}
        >
          {name}
        </Text>
      ))}
      <Text className="font-title text-xl text-white">{name}</Text>
    </View>
  );
}

const GLOW_RINGS = [
  { className: 'h-[340px] w-[340px] bg-white/30', pulse: 0.06 },
  { className: 'h-[260px] w-[260px] bg-white/50', pulse: 0.04 },
  { className: 'h-[190px] w-[190px] bg-white/70', pulse: 0.02 },
] as const;
const RING_STAGGER_MS = 80;
const PULSE_MS = 1200;
const CHARACTER_ENTER_MS = 600;
const FLOAT_PX = 6;
const FLOAT_MS = 1400;

const GlowRing = ({ index, ring }: { index: number; ring: (typeof GLOW_RINGS)[number] }) => {
  const progress = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withRepeat(
      withTiming(1, { duration: PULSE_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [progress, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * ring.pulse }],
  }));

  return (
    <Animated.View
      entering={ZoomIn.delay(index * RING_STAGGER_MS).springify()}
      className="absolute"
    >
      <Animated.View style={style} className={`rounded-full ${ring.className}`} />
    </Animated.View>
  );
};

interface Props {
  result: GotchaPull;
  /** 5회 뽑기 진행 표시. 1회 뽑기면 생략. */
  progress?: { current: number; total: number };
  /** 아무 곳이나 탭하면 호출. 다음 결과로 넘기거나 마지막이면 닫는다. */
  onDismiss: () => void;
}

export default function Gotcha({ result, progress, onDismiss }: Props) {
  const float = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    float.value = withDelay(
      CHARACTER_ENTER_MS,
      withRepeat(withTiming(1, { duration: FLOAT_MS, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [float, reduceMotion]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -float.value * FLOAT_PX }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Pressable className="flex-1 items-center justify-center bg-gray-400/50" onPress={onDismiss}>
        <View key={progress?.current ?? 0} className="items-center justify-center">
          {GLOW_RINGS.map((ring, i) => (
            <GlowRing key={i} index={i} ring={ring} />
          ))}

          <View className="items-center">
            <Animated.View entering={FadeInDown.delay(250).springify()}>
              <OutlinedItemName name={result.name} />
            </Animated.View>

            <Animated.View entering={BounceIn.duration(CHARACTER_ENTER_MS)}>
              <Animated.View style={floatStyle}>
                <Character config={result.preview} size={230} />
                {result.duplicate ? null : (
                  <Animated.View
                    entering={ZoomIn.delay(CHARACTER_ENTER_MS).springify()}
                    className="absolute right-lg top-lg rounded-full bg-primary-600 px-md py-xs"
                  >
                    <Text className="font-title text-md text-white">NEW</Text>
                  </Animated.View>
                )}
              </Animated.View>
            </Animated.View>

            {progress ? (
              <Animated.View entering={FadeIn.delay(350)}>
                <Typography variant="body1" className="text-gray-500">
                  {progress.current} / {progress.total}
                </Typography>
              </Animated.View>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
