import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import CapsuleBottom from '@/assets/images/gacha/capsule-bottom.svg';
import CapsuleTop from '@/assets/images/gacha/capsule-top.svg';
import Typography from '@/components/ui/Typography';

const SIZE = 140;
const START_SCALE = 0.3;
const POP_MS = 700;
/** 출구에서 가운데로 날아올 때 위로 솟는 높이. 직선으로 오면 밋밋하다. */
const ARC_PX = 120;
const SPIN_DEG = 360;
const WOBBLE_DEG = 8;
const OPEN_MS = 380;
const TOP_FLY_PX = 120;
const BOTTOM_DROP_PX = 70;
const FLASH_SCALE = 4;

interface Point {
  x: number;
  y: number;
}

interface Props {
  /** 캡슐이 튀어나올 출구 위치(창 기준 좌표) */
  from: Point;
  /** 캡슐이 다 열려 결과를 보여 줄 차례 */
  onOpened: () => void;
}

export default function CapsuleReveal({ from, onOpened }: Props) {
  const rootRef = useRef<View>(null);
  // 출구 좌표가 창 기준이라, 이 오버레이의 창 기준 위치를 알아야 캡슐을 그 자리에 놓을 수 있다.
  const [frame, setFrame] = useState<(Point & { width: number; height: number }) | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const pop = useSharedValue(0);
  const wobble = useSharedValue(0);
  const open = useSharedValue(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    rootRef.current?.measureInWindow((x, y) => setFrame({ x, y, width, height }));
  };

  useEffect(() => {
    if (!frame) return;
    const ready = () => setIsReady(true);
    pop.value = withTiming(
      1,
      { duration: POP_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(ready)();
      },
    );
  }, [frame, pop]);

  useEffect(() => {
    if (!isReady || isOpening) return;
    const easing = Easing.inOut(Easing.quad);
    // 흔들고 잠깐 쉬기를 반복해 "열어 달라"는 신호를 준다. 계속 흔들면 정신없다.
    wobble.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 120, easing }),
        withTiming(-1, { duration: 240, easing }),
        withTiming(0, { duration: 120, easing }),
        withTiming(0, { duration: 600 }),
      ),
      -1,
    );
  }, [isReady, isOpening, wobble]);

  const handleOpen = () => {
    setIsOpening(true);
    const done = () => onOpened();
    // 핸들러에서는 .value 대입 대신 set()을 쓴다. React Compiler가 effect에서 쓴 값의 대입을 막는다.
    wobble.set(withTiming(0, { duration: 80 }));
    open.set(
      withTiming(1, { duration: OPEN_MS, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(done)();
      }),
    );
  };

  const start = frame
    ? { x: from.x - frame.x - SIZE / 2, y: from.y - frame.y - SIZE / 2 }
    : { x: 0, y: 0 };
  const end = frame ? { x: (frame.width - SIZE) / 2, y: (frame.height - SIZE) / 2 } : start;

  const backdropStyle = useAnimatedStyle(() => ({ opacity: pop.value }));
  const capsuleStyle = useAnimatedStyle(() => {
    const p = pop.value;
    return {
      opacity: frame ? 1 : 0,
      transform: [
        { translateX: start.x + (end.x - start.x) * p },
        { translateY: start.y + (end.y - start.y) * p - ARC_PX * 4 * p * (1 - p) },
        { scale: START_SCALE + (1 - START_SCALE) * p },
        { rotate: `${(p - 1) * SPIN_DEG + wobble.value * WOBBLE_DEG}deg` },
      ],
    };
  });
  const topStyle = useAnimatedStyle(() => ({
    opacity: 1 - open.value,
    transform: [{ translateY: -open.value * TOP_FLY_PX }, { rotate: `${-open.value * 35}deg` }],
  }));
  const bottomStyle = useAnimatedStyle(() => ({
    opacity: 1 - open.value,
    transform: [{ translateY: open.value * BOTTOM_DROP_PX }, { rotate: `${open.value * 15}deg` }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: open.value === 0 ? 0 : 1 - open.value,
    transform: [{ scale: open.value * FLASH_SCALE }],
  }));

  return (
    <Animated.View
      ref={rootRef}
      collapsable={false}
      onLayout={handleLayout}
      exiting={FadeOut.duration(200)}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View className="bg-gray-400/50" style={[StyleSheet.absoluteFill, backdropStyle]} />

      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleOpen}
        disabled={!isReady || isOpening}
        accessibilityRole="button"
        accessibilityLabel="캡슐 열기"
      >
        <Animated.View
          className="absolute rounded-full bg-white"
          style={[{ left: end.x, top: end.y, width: SIZE, height: SIZE }, flashStyle]}
        />
        <Animated.View
          className="absolute left-0 top-0"
          style={[{ width: SIZE, height: SIZE }, capsuleStyle]}
        >
          <Animated.View style={[StyleSheet.absoluteFill, bottomStyle]}>
            <CapsuleBottom width="100%" height="100%" />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, topStyle]}>
            <CapsuleTop width="100%" height="100%" />
          </Animated.View>
        </Animated.View>

        {isReady && !isOpening ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            className="absolute inset-x-0 items-center"
            style={{ top: end.y + SIZE + 24 }}
          >
            <Typography variant="body1" className="text-white">
              탭해서 열어보세요
            </Typography>
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}
