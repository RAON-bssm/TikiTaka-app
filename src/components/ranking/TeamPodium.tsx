import { View } from 'react-native';

import Typography from '@/components/ui/Typography';
import type { TeamRank } from '@/types/territory';

interface Props {
  /** 1~3위. 같은 합계면 같은 순위라 rank 값이 겹칠 수 있다. */
  teams: TeamRank[];
  myTeamId: number | undefined;
}

/** 빈 랭킹(RankingEmptyState)과 같은 포디움 모양. 가운데가 1위다. */
export default function TeamPodium({ teams, myTeamId }: Props) {
  const [first, second, third] = teams;

  return (
    <View className="flex-row items-end justify-center gap-md">
      <Column team={second} place={2} myTeamId={myTeamId} />
      <Column team={first} place={1} myTeamId={myTeamId} />
      <Column team={third} place={3} myTeamId={myTeamId} />
    </View>
  );
}

function Column({
  team,
  place,
  myTeamId,
}: {
  team: TeamRank | undefined;
  place: 1 | 2 | 3;
  myTeamId: number | undefined;
}) {
  if (!team) return <View className="w-20" />;
  const mine = team.location_id === myTeamId;
  const top = place === 1;

  return (
    <View className="w-24 items-center gap-xs">
      <Typography
        variant={top ? 'h3' : 'h4'}
        className={mine ? 'text-primary-700' : 'text-gray-800'}
        numberOfLines={1}
      >
        {team.location_name}
      </Typography>
      <Typography variant="caption" className="text-gray-400">
        {team.total_land_price.toLocaleString()}
      </Typography>
      <View
        className={`w-20 items-center justify-center rounded-t-lg ${
          top ? 'h-24 bg-primary-200' : 'h-16 bg-gray-100'
        }`}
      >
        <Typography
          variant={top ? 'h1' : 'h3'}
          className={top ? 'text-primary-600' : 'text-gray-400'}
        >
          {team.rank}
        </Typography>
        {mine && (
          <Typography variant="caption" className="text-primary-600">
            우리 팀
          </Typography>
        )}
      </View>
    </View>
  );
}
