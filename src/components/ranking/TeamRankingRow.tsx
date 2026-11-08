import { View } from 'react-native';

import Typography from '@/components/ui/Typography';
import type { TeamRank } from '@/types/territory';

interface Props {
  team: TeamRank;
  mine: boolean;
}

/** 팀랭킹 4위부터의 한 줄. 1~3위는 포디움(TeamPodium)으로 따로 보여준다. */
export default function TeamRankingRow({ team, mine }: Props) {
  return (
    <View className={`px-xl ${mine ? 'bg-primary-100' : 'bg-white'}`}>
      <View className="flex-row items-center gap-md border-b border-gray-100 px-md py-lg">
        <Typography variant="body1" className="w-[28px] text-gray-500">
          {team.rank}
        </Typography>
        <View className="flex-1 flex-row items-center gap-xs">
          <Typography variant="body1" className={mine ? 'text-primary-700' : 'text-gray-800'}>
            {team.location_name}
          </Typography>
          {mine && (
            <View className="rounded-full bg-primary-600 px-sm py-xs">
              <Typography variant="caption" className="text-white">
                우리 팀
              </Typography>
            </View>
          )}
        </View>
        <Typography variant="caption" className="text-gray-400">
          {`땅 ${team.owned_dong_count}곳`}
        </Typography>
        <Typography variant="body1" className="w-[80px] text-right text-primary-600">
          {team.total_land_price.toLocaleString()}
        </Typography>
      </View>
    </View>
  );
}
