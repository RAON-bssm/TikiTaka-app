import { View } from 'react-native';

import DistrictBattleStatus from '@/components/feed/DistrictBattleStatus';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Typography from '@/components/ui/Typography';
import type { CurrentBattleState } from '@/hooks/match/useCurrentBattle';

interface Props {
  state: CurrentBattleState;
}

/** 대결 카드와 같은 껍데기. 상태가 바뀌어도 자리가 흔들리지 않게 테두리·여백을 맞춘다. */
const EmptyBattle = ({ hasAnyBattle }: { hasAnyBattle: boolean }) => (
  <View className="w-full items-center gap-sm rounded-md border border-gray-100 bg-white p-lg">
    <Typography variant="h4" className="text-gray-600">
      우리 팀의 현재 상황
    </Typography>
    <Typography variant="body3" className="text-center text-gray-500">
      {hasAnyBattle
        ? '이번 라운드는 우리 동네 대결이 없어요'
        : '진행 중인 라운드가 없어요. 다음 라운드를 기다려주세요'}
    </Typography>
  </View>
);

/**
 * 홈·피드 맨 위의 우리 동네 대결 현황.
 *
 * 대결이 없을 때 아무것도 그리지 않으면 카드가 통째로 사라져 사용자는 오류인지 원래 없는 건지
 * 알 수 없다. 그래서 네 상태(로딩·실패·없음·있음)를 모두 그린다.
 *
 * 훅을 직접 부르지 않고 상태를 받는 이유: 화면이 당겨서 새로고침에 `refetch`를 함께 엮는다.
 */
export default function CurrentBattleCard({ state }: Props) {
  if (state.isLoading) {
    return <Skeleton className="h-[184px] w-full rounded-md" />;
  }

  if (state.isError) {
    return <ErrorRetry message="대결 상황을 불러오지 못했어요." onRetry={state.refetch} />;
  }

  if (!state.battle) {
    return <EmptyBattle hasAnyBattle={state.hasAnyBattle} />;
  }

  return (
    <DistrictBattleStatus
      myTeam={state.battle.myTeam}
      opponentTeam={state.battle.opponentTeam}
      isBye={state.battle.isBye}
    />
  );
}
