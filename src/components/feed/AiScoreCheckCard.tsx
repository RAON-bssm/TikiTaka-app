import InfoIcon from '@/assets/icons/info.svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

const GRADIENT_COLORS = ['#FFFFFF', '#FFD5BE'] as const;

const randomScore = () => Math.floor(Math.random() * 99) + 1;
const ROLL_INTERVAL = 90;

interface Props {
  onCheck?: () => void;
}

export default function AiScoreCheckCard({ onCheck }: Props) {
  const [rolling, setRolling] = useState(randomScore);
  useEffect(() => {
    const id = setInterval(() => setRolling(randomScore()), ROLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.08, { duration: 450, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [scale]);
  const numberStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View className="relative overflow-hidden rounded-md p-lg">
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="items-center justify-center p-2xl">
        <View className="items-center gap-sm">
          <Animated.View style={numberStyle}>
            <Typography
              variant="display"
              className="text-primary-600 text-[64px] leading-[72px] font-bold"
            >
              {rolling}
            </Typography>
          </Animated.View>
          <Button content="AI 점수 확인하기" size="sm" onclick={onCheck} />
        </View>
      </View>
      <View className="absolute right-sm top-sm">
        <InfoIcon width={24} height={24} color="#C4CCDA" />
      </View>
    </View>
  );
}
