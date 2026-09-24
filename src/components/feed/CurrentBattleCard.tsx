import { View } from 'react-native';

import DistrictBattleStatus from '@/components/feed/DistrictBattleStatus';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Typography from '@/components/ui/Typography';
import type { CurrentBattleState } from '@/hooks/match/useCurrentBattle';

interface Props {
  state: CurrentBattleState;
}

/** 상태가 바뀌어도 자리가 흔들리지 않게 대결 카드와 테두리·여백을 맞춘다. */
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
 * 대결이 없을 때도 카드를 그려야 오류와 구분되므로 로딩·실패·없음·있음을 모두 그린다.
 * 상태를 prop으로 받는 이유: 화면이 당겨서 새로고침에 `refetch`를 엮는다.
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
