import { View } from 'react-native';

import UserCharacter from '@/components/character/UserCharacter';
import Ranking from '@/components/ui/Ranking';
import { formatLocationName } from '@/constants/location';
import type { LocationRanking, UserRanking } from '@/types/ranking';

export type RankingRowItem =
  | { kind: 'district'; key: string; data: LocationRanking }
  | { kind: 'person'; key: string; data: UserRanking };

interface Props {
  row: RankingRowItem;
  myUserId?: string;
  onBlock: (target: { userId: string; userName: string }) => void;
}

export default function RankingRow({ row, myUserId, onBlock }: Props) {
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
        avatar={<UserCharacter userId={item.user_id} size={50} />}
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
