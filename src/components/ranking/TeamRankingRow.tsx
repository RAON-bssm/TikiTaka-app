import { View } from 'react-native';

import Ranking from '@/components/ui/Ranking';
import type { TeamRank } from '@/types/territory';

interface Props {
  team: TeamRank;
}

export default function TeamRankingRow({ team }: Props) {
  return (
    <View className="bg-white px-xl">
      <Ranking
        number={team.rank}
        location={`${team.location_name} · 땅 ${team.owned_dong_count}곳`}
        count={team.total_land_price.toLocaleString()}
        unit=""
      />
    </View>
  );
}
