import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import LogoIcon from '@/assets/images/splash/logo.svg';
import RingIcon from '@/assets/images/splash/ring.svg';
import StarIcon from '@/assets/images/splash/star.svg';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';

const GRADIENT_COLORS = [
  palette.primary[600],
  palette.primary[600],
  palette.secondary[100],
] as const;
const GRADIENT_LOCATIONS = [0, 0.5, 1] as const;

// 토큰 확인은 대개 순식간이라, 최소 시간이 없으면 스플래시가 깜빡이고 사라진다.
const MIN_VISIBLE_MS = 1500;

/**
 * 네이티브 스플래시는 그라디언트·배치를 못 그려서, 같은 배경색의 네이티브 스플래시 위에 이어 띄운다.
 * 로그인 판정과 첫 화면 이동이 이 뒤에서 끝나므로 화면이 튀는 게 보이지 않는다.
 */
export default function AppSplash() {
  const status = useAuthStatus();
  const [isMinTimeElapsed, setIsMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMinTimeElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  if (status !== 'loading' && isMinTimeElapsed) return null;

  return (
    <Animated.View exiting={FadeOut.duration(300)} style={StyleSheet.absoluteFill}>
      <StatusBar style="light" />
      <LinearGradient
        colors={GRADIENT_COLORS}
        locations={GRADIENT_LOCATIONS}
        style={StyleSheet.absoluteFill}
      />

      <View className="absolute" style={{ top: '8.8%', left: '-7.2%' }}>
        <RingIcon width={189} height={198.934} />
      </View>

      <View
        className="absolute items-center justify-center"
        style={{ right: -72, bottom: 0, width: 254, height: 281 }}
      >
        <View style={{ transform: [{ rotate: '-24.2deg' }] }}>
          <StarIcon width={186.203} height={220.32} />
        </View>
      </View>

      <View className="absolute inset-x-0 items-center gap-xl" style={{ top: '28%' }}>
        <LogoIcon width={250} height={52} />
        <Typography variant="h3" className="text-white">
          여러분들의 동네 리그에 참여해보세요!
        </Typography>
      </View>
    </Animated.View>
  );
}
