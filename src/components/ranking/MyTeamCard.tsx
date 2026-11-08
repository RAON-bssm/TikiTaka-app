import type { ReactNode } from 'react';
import { View } from 'react-native';

import Typography from '@/components/ui/Typography';
import type { TeamRank } from '@/types/territory';

interface Props {
  teams: TeamRank[];
  myTeam: TeamRank | undefined;
  finalized: boolean;
  /** 집계 상태 줄과 우리 팀 카드 사이에 둘 것(포디움) */
  children?: ReactNode;
}

/** 팀랭킹 탭 맨 위. 집계 상태와 우리 팀 순위, 바로 위 팀까지의 차이를 보여준다. */
export default function MyTeamCard({ teams, myTeam, finalized, children }: Props) {
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
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-xs">
          <View
            className={`h-[8px] w-[8px] rounded-full ${finalized ? 'bg-gray-400' : 'bg-primary-600'}`}
          />
          <Typography variant="h4" className={finalized ? 'text-gray-500' : 'text-primary-600'}>
            {finalized ? '최종 순위' : '실시간 집계 중'}
          </Typography>
        </View>
        <Typography variant="caption" className="text-gray-400">
          구별 땅값 합계 순위
        </Typography>
      </View>

      {children}

      {myTeam && (
        <View className="flex-row items-center gap-lg rounded-md bg-primary-100 px-lg py-md">
          <View className="flex-row items-end">
            <Typography variant="display" className="text-primary-600">
              {myTeam.rank}
            </Typography>
            <Typography variant="h3" className="pb-xs text-primary-600">
              위
            </Typography>
          </View>
          <View className="flex-1 gap-xs">
            <Typography variant="h3" className="text-gray-800">
              {`우리 팀 ${myTeam.location_name}`}
            </Typography>
            <Typography variant="body3" className="text-gray-500">
              {gapText}
            </Typography>
          </View>
          <View className="items-end gap-xs">
            <Typography variant="h3" className="text-primary-700">
              {myTeam.total_land_price.toLocaleString()}
            </Typography>
            <Typography variant="caption" className="text-gray-400">
              {`땅 ${myTeam.owned_dong_count}곳`}
            </Typography>
          </View>
        </View>
      )}
    </View>
  );
}
