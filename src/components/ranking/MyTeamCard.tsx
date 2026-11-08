import { View } from 'react-native';

import { PulsingDot } from '@/components/ranking/StageBadge';
import Ranking from '@/components/ui/Ranking';
import Typography from '@/components/ui/Typography';
import type { TeamRank } from '@/types/territory';

interface Props {
  teams: TeamRank[];
  myTeam: TeamRank | undefined;
  finalized: boolean;
}

/** 팀랭킹 탭 맨 위. 다른 탭의 StageBadge·내 순위와 같은 구성에 바로 위 팀까지의 차이를 더한다. */
export default function MyTeamCard({ teams, myTeam, finalized }: Props) {
  // 같은 합계는 같은 순위라, 우리 팀보다 합계가 큰 팀 중 가장 작은 팀이 바로 위 팀이다.
  const above = myTeam
    ? teams
        .filter((team) => team.total_land_price > myTeam.total_land_price)
        .sort((a, b) => a.total_land_price - b.total_land_price)[0]
    : undefined;
  const gapText = !myTeam
    ? undefined
    : above
      ? `${above.rank}위 ${above.location_name}까지 ${(
          above.total_land_price - myTeam.total_land_price
        ).toLocaleString()} 남았어요`
      : finalized
        ? '우리 팀이 1위로 끝났어요'
        : '지금 우리 팀이 1위예요';

  return (
    <View className="gap-lg">
      <View className="w-full flex-row items-center gap-md rounded-full border border-gray-200 bg-white px-lg py-sm">
        {finalized ? <View className="h-md w-md rounded-full bg-gray-400" /> : <PulsingDot />}
        <Typography variant="h4" className={finalized ? 'text-gray-500' : 'text-primary-600'}>
          땅따먹기
        </Typography>
        <View className="h-md border-l border-primary-300" />
        <Typography variant="body3" className="flex-1 text-center text-gray-700">
          {finalized ? '구별 땅값 합계 최종 순위' : '구별 땅값 합계 집계 중'}
        </Typography>
      </View>

      {myTeam && (
        <View className="border-b border-gray-100">
          <Typography variant="caption" className="px-md text-gray-400">
            우리 팀 순위
          </Typography>
          <Ranking
            number={myTeam.rank}
            location={`${myTeam.location_name} · 땅 ${myTeam.owned_dong_count}곳`}
            count={myTeam.total_land_price.toLocaleString()}
            unit=""
          />
          {gapText && (
            <Typography variant="caption" className="-mt-md px-md pb-md text-center text-gray-400">
              {gapText}
            </Typography>
          )}
        </View>
      )}
    </View>
  );
}
