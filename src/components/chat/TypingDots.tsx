import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const BOUNCE_PX = 4;
const BOUNCE_MS = 300;
/** 점마다 이만큼 늦게 튀어 차례로 물결치게 한다. */
const STAGGER_MS = 150;
/** 세 점이 다 튀고 쉬는 시간 */
const REST_MS = 300;

const Dot = ({ index }: { index: number }) => {
  const offset = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const easing = Easing.inOut(Easing.ease);
    // 지연을 반복 안에 넣고 앞에서 늦게 시작한 만큼 뒤에서 덜 쉬어, 세 점의 한 바퀴 길이를 같게 맞춘다.
    // 길이가 다르면 바퀴가 돌수록 박자가 어긋난다.
    offset.value = withRepeat(
      withSequence(
        withTiming(0, { duration: index * STAGGER_MS }),
        withTiming(-BOUNCE_PX, { duration: BOUNCE_MS, easing }),
        withTiming(0, { duration: BOUNCE_MS, easing }),
        withTiming(0, { duration: REST_MS + (2 - index) * STAGGER_MS }),
      ),
      -1,
    );
  }, [offset, reduceMotion, index]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));

  return <Animated.View style={style} className="h-[6px] w-[6px] rounded-full bg-gray-400" />;
};

/** 답을 기다리는 동안 말풍선 안에 넣는 세 점. 웹 지도의 대기 말풍선과 같은 연출이다. */
export default function TypingDots() {
  return (
    <View className="h-[20px] flex-row items-center gap-xs" accessibilityLabel="답을 기다리는 중">
      <Dot index={0} />
      <Dot index={1} />
      <Dot index={2} />
    </View>
  );
}
