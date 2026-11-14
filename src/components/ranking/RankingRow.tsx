import { memo } from 'react';
import { View } from 'react-native';

import UserCharacter from '@/components/character/UserCharacter';
import Ranking from '@/components/ui/Ranking';
import { formatLocationName } from '@/constants/location';
import type { LocationRanking, UserRanking } from '@/types/ranking';
import type { TeamRank } from '@/types/territory';
import TeamRankingRow from './TeamRankingRow';

export type RankingRowItem =
  | { kind: 'district'; key: string; data: LocationRanking }
  | { kind: 'person'; key: string; data: UserRanking }
  | { kind: 'team'; key: string; data: TeamRank };

interface Props {
  row: RankingRowItem;
  myUserId?: string;
  onBlock: (target: { userId: string; userName: string }) => void;
}

/** row·myUserId·onBlock이 그대로면(쿼리 재조회로 목록이 구조적으로 공유될 때) 다시 그리지 않는다. */
function RankingRow({ row, myUserId, onBlock }: Props) {
  if (row.kind === 'team') {
    return <TeamRankingRow team={row.data} />;
  }

  if (row.kind === 'district') {
    const item = row.data;
    return (
      <View className="bg-white px-xl">
        <Ranking
          number={item.location_rank}
          location={formatLocationName(item.city_name, item.location_name)}
          count={item.location_score}
        />
      </View>
    );
  }

  const item = row.data;
  return (
    <View className="bg-white px-xl">
      <Ranking
        number={item.user_rank}
        location={item.user_name}
        count={item.user_score}
        avatar={<UserCharacter userId={item.user_id} size={50} equipment={item.user_equipment} />}
        menuItems={
          !myUserId || item.user_id === myUserId
            ? undefined
            : [
                {
                  label: '차단하기',
                  destructive: true,
                  onPress: () => onBlock({ userId: item.user_id, userName: item.user_name }),
                },
              ]
        }
      />
    </View>
  );
}

export default memo(RankingRow);
