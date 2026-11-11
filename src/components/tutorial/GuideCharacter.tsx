import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import Character from '@/components/character/Character';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';

const BOB_PX = 6;
const BOB_HALF_MS = 600;

/** 가이드는 사용자 본인 캐릭터다. 위아래로 살짝 떠 있어야 멈춘 그림이 아니라 말하는 것처럼 보인다. */
export default function GuideCharacter({ size }: { size: number }) {
  const { config } = useCharacterConfig();
  const offset = useSharedValue(0);

  useEffect(() => {
    const ease = { duration: BOB_HALF_MS, easing: Easing.inOut(Easing.quad) };
    offset.set(withRepeat(withSequence(withTiming(-BOB_PX, ease), withTiming(0, ease)), -1));
    return () => cancelAnimation(offset);
  }, [offset]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: offset.get() }] }));

  return (
    <Animated.View style={style}>
      <Character config={config} size={size} />
    </Animated.View>
  );
}
