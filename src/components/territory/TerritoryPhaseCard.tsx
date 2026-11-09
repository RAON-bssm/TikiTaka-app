import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import ShapeLeft from '@/assets/images/territory/banner-shape-left.svg';
import ShapeStar from '@/assets/images/territory/banner-shape-star.svg';
import Typography from '@/components/ui/Typography';
import { describeTimeLeft, type TerritoryPhase } from '@/hooks/territory/useTerritoryPhase';
import type { CurrentCycle } from '@/types/territory';

interface Props {
  phase: Exclude<TerritoryPhase, 'none'>;
  cycle: CurrentCycle;
  now: number;
  preferenceCount: number;
  /** 대표가 됐지만 아직 미션·사진을 정하지 않은 내 땅 수 */
  unsetCount: number;
  myTeamRank: number | undefined;
  onPress: () => void;
}

function getCopy({
  phase,
  cycle,
  now,
  preferenceCount,
  unsetCount,
  myTeamRank,
}: Omit<Props, 'onPress'>) {
  switch (phase) {
    case 'selection':
      return {
        label: '대표 선발전',
        title: `희망 동 ${preferenceCount}/3 등록`,
        action: preferenceCount === 0 ? '고르기' : '바꾸기',
        description: describeTimeLeft(
          cycle.ranking_freeze_at,
          now,
          (left) => `포인트 순위로 동 대표를 뽑아요 · 마감까지 ${left}`,
          '곧 랭킹이 멈추고 대표를 뽑아요',
        ),
      };
    case 'awaitingPick':
      return {
        label: '대표 발표',
        title: '곧 동 대표가 발표돼요',
        action: '바꾸기',
        description: '희망 동은 발표 전까지 바꿀 수 있어요',
      };
    case 'setup':
      return unsetCount > 0
        ? {
            label: '땅 세팅',
            title: `대표가 됐어요! 땅 ${unsetCount}곳`,
            action: '세팅하기',
            description: '미션을 정하고 방어 사진을 찍어요',
          }
        : {
            label: '땅 세팅',
            title: '세팅을 모두 마쳤어요',
            action: '결과 보기',
            description: describeTimeLeft(
              cycle.battle_started_at,
              now,
              (left) => `땅따먹기 시작까지 ${left}`,
              '곧 땅따먹기가 시작돼요',
            ),
          };
    case 'battle':
      return {
        label: '땅따먹기',
        title: myTeamRank ? `우리 팀 ${myTeamRank}위` : '다른 팀 땅을 빼앗아요',
        action: '보러 가기',
        description: describeTimeLeft(
          cycle.battle_ended_at,
          now,
          (left) => `끝나기까지 ${left}`,
          '곧 땅따먹기가 끝나요',
        ),
      };
  }
}

// Figma 배너 모션은 지도 위에서 쉬지 않고 돌기엔 너무 세서, 별만 천천히 돌리고 버튼은 가끔 살짝 숨 쉬게 줄였다.
const STAR_SPIN_MS = 20000;
const BREATHE_MS = 800;
const BREATHE_REST_MS = 3200;
const BREATHE_SCALE = 1.05;

/** 지도 위에는 단계 안내를 이 배너 한 장만 띄우고, 목록·행동은 땅따먹기 허브로 보낸다. */
export default function TerritoryPhaseCard({ onPress, ...rest }: Props) {
  const copy = getCopy(rest);
  const reduceMotion = useReducedMotion();
  const star = useSharedValue(0);
  const breathe = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    star.value = withRepeat(
      withTiming(-360, { duration: STAR_SPIN_MS, easing: Easing.linear }),
      -1,
    );
    breathe.value = withRepeat(
      withSequence(
        withTiming(BREATHE_SCALE, { duration: BREATHE_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: BREATHE_MS, easing: Easing.inOut(Easing.ease) }),
        withDelay(BREATHE_REST_MS, withTiming(1, { duration: 0 })),
      ),
      -1,
    );
  }, [reduceMotion, star, breathe]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${STAR_TILT + star.value}deg` }],
  }));
  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${copy.label}, ${copy.title}, ${copy.action}`}
      className="flex-row items-center justify-between gap-md overflow-hidden rounded-sm bg-primary-600 p-lg active:opacity-80"
    >
      <View pointerEvents="none" style={styles.ring}>
        <ShapeLeft width={RING_SIZE.width} height={RING_SIZE.height} />
      </View>
      <Animated.View pointerEvents="none" style={[styles.star, starStyle]}>
        <ShapeStar width={STAR_SIZE.width} height={STAR_SIZE.height} />
      </Animated.View>

      <View className="flex-1 gap-xs">
        <Typography variant="caption" className="text-primary-100" numberOfLines={1}>
          {copy.description ? `${copy.label} · ${copy.description}` : copy.label}
        </Typography>
        <Typography variant="h2" className="text-white" numberOfLines={1}>
          {copy.title}
        </Typography>
      </View>
      <Animated.View style={breatheStyle} className="rounded-sm bg-secondary-100 p-md">
        <Typography variant="h3" className="text-primary-600">
          {copy.action}
        </Typography>
      </Animated.View>
    </Pressable>
  );
}

// 장식 도형의 크기·위치는 Figma 프레임(335×75) 기준 값이다. 별은 오른쪽 끝에 붙여 카드 폭이 바뀌어도 따라간다.
const RING_SIZE = { width: 149, height: 157 };
const STAR_SIZE = { width: 85, height: 101 };
const STAR_TILT = -24;

const styles = StyleSheet.create({
  ring: { position: 'absolute', left: -10, top: -15, ...RING_SIZE },
  star: { position: 'absolute', right: -6, top: -47, ...STAR_SIZE },
});
