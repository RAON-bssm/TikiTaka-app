import { useEffect, useEffectEvent, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import MachineBody from '@/assets/images/gacha/machine-body.svg';
import MachineCapsules from '@/assets/images/gacha/machine-capsules.svg';
import MachineDome from '@/assets/images/gacha/machine-dome.svg';
import MachineHandle from '@/assets/images/gacha/machine-handle.svg';

// 레이어는 모두 같은 400×600 캔버스에 제자리로 그려져 있어 겹치기만 하면 맞는다.
const CANVAS = { width: 400, height: 600 };
export const MACHINE_ASPECT_RATIO = CANVAS.width / CANVAS.height;
/** 출구 중앙(캔버스 비율). 캡슐이 여기서 튀어나온다. */
export const MACHINE_EXIT = { x: 199.5 / CANVAS.width, y: 525 / CANVAS.height };
// 손잡이 레이어도 캔버스 전체 크기라, 손잡이 중심을 축으로 지정해야 제자리에서 돈다.
// 문자열("x% y%")로 주면 RN이 긴 소수를 잘못 쪼개 z값으로 읽고 죽는다. 배열로 넘긴다.
const toPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
const HANDLE_ORIGIN = [
  toPercent(280.3 / CANVAS.width),
  toPercent(407.8 / CANVAS.height),
  0,
] satisfies [string, string, number];

const TURN_MS = 800;
const JIGGLE_MS = TURN_MS / 4;
const PILE_JUMP_PX = 6;
const PILE_TILT_DEG = 3;
const SWAY_DEG = 1.5;
/** 한 바퀴 동안 캡슐·통이 흔들리는 궤적(-1~1). 점점 잦아들게 해 덜컹임이 자연스럽다. */
const JIGGLE_STEPS = [1, -0.6, 0.35, 0];

const LAYER = StyleSheet.absoluteFill;

interface Props {
  /** true인 동안 손잡이를 한 바퀴씩 계속 돌린다. false가 되면 돌던 바퀴까지만 마저 돈다. */
  cranking: boolean;
  /** 손잡이가 한 바퀴를 다 돌 때마다 호출. 결과가 왔으면 여기서 cranking을 끈다. */
  onTurnEnd: () => void;
}

/** 부모 크기를 채운다. 부모에 MACHINE_ASPECT_RATIO 비율을 줄 것. */
export default function GachaMachine({ cranking, onTurnEnd }: Props) {
  const [turn, setTurn] = useState(0);
  const handle = useSharedValue(0);
  const jiggle = useSharedValue(0);

  // 바퀴 단위로 끊어야 결과가 언제 오든 손잡이가 제자리(0°)에서 멈춘다.
  const endTurn = useEffectEvent(() => {
    onTurnEnd();
    setTurn((prev) => prev + 1);
  });

  useEffect(() => {
    if (!cranking) return;
    const done = () => endTurn();
    handle.value = withTiming(
      (turn + 1) * 360,
      { duration: TURN_MS, easing: Easing.inOut(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(done)();
      },
    );
    jiggle.value = withSequence(
      ...JIGGLE_STEPS.map((step) =>
        withTiming(step, { duration: JIGGLE_MS, easing: Easing.inOut(Easing.quad) }),
      ),
    );
  }, [cranking, turn, handle, jiggle]);

  const swayStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${jiggle.value * SWAY_DEG}deg` }],
  }));
  const pileStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -Math.abs(jiggle.value) * PILE_JUMP_PX },
      { rotate: `${jiggle.value * PILE_TILT_DEG}deg` },
    ],
  }));
  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${handle.value}deg` }],
  }));

  return (
    <Animated.View style={[LAYER, { transformOrigin: 'bottom' }, swayStyle]}>
      <MachineDome width="100%" height="100%" style={LAYER} />
      <Animated.View style={[LAYER, pileStyle]}>
        <MachineCapsules width="100%" height="100%" />
      </Animated.View>
      <MachineBody width="100%" height="100%" style={LAYER} />
      <Animated.View style={[LAYER, { transformOrigin: HANDLE_ORIGIN }, handleStyle]}>
        <MachineHandle width="100%" height="100%" />
      </Animated.View>
    </Animated.View>
  );
}
