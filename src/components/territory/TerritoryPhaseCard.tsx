import { Pressable, View } from 'react-native';

import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { describeTimeLeft, type TerritoryPhase } from '@/hooks/territory/useTerritoryPhase';
import type { CurrentCycle } from '@/types/territory';

const CARD_SHADOW = `0px 4px 16px ${palette.gray[800]}1F`;

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
        description: '희망 동은 발표 전까지 바꿀 수 있어요',
      };
    case 'setup':
      return unsetCount > 0
        ? {
            label: '땅 세팅',
            title: `대표가 됐어요! 땅 ${unsetCount}곳 세팅하기`,
            description: '미션을 정하고 방어 사진을 찍어요',
          }
        : {
            label: '땅 세팅',
            title: '선발 결과 보기',
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
        title: myTeamRank ? `우리 팀 ${myTeamRank}위` : '다른 팀 땅을 빼앗아 보세요',
        description: describeTimeLeft(
          cycle.battle_ended_at,
          now,
          (left) => `팀 순위·내 땅 보기 · 끝나기까지 ${left}`,
          '팀 순위·내 땅 보기',
        ),
      };
  }
}

/** 지도 위에는 단계 안내를 이 카드 한 장만 띄우고, 목록·행동은 땅따먹기 허브로 보낸다. */
export default function TerritoryPhaseCard({ onPress, ...rest }: Props) {
  const copy = getCopy(rest);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-md rounded-md border border-gray-100 bg-white px-lg py-md active:opacity-80"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <View className="rounded-full bg-primary-100 px-sm py-xs">
        <Typography variant="caption" className="text-primary-600">
          {copy.label}
        </Typography>
      </View>
      <View className="flex-1 gap-xs">
        <Typography variant="h4" className="text-gray-700" numberOfLines={1}>
          {copy.title}
        </Typography>
        {!!copy.description && (
          <Typography variant="caption" className="text-gray-400" numberOfLines={1}>
            {copy.description}
          </Typography>
        )}
      </View>
      <ChevronRightIcon width={20} height={20} color={palette.gray[400]} />
    </Pressable>
  );
}
