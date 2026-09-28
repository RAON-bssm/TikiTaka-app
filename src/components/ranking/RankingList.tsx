import { View } from 'react-native';

import UserCharacter from '@/components/character/UserCharacter';
import RankingEmptyState from '@/components/ranking/RankingEmptyState';
import Ranking from '@/components/ui/Ranking';
import { formatLocationName } from '@/constants/location';
import type { RankingTab } from '@/constants/ranking';
import type { LocationRanking, UserRanking } from '@/types/ranking';

interface Props {
  tab: RankingTab;
  districts: LocationRanking[];
  persons: UserRanking[];
}

export default function RankingList({ tab, districts, persons }: Props) {
  const rows = tab === '동네랭킹' ? districts : persons;

  if (rows.length === 0) {
    const description =
      tab === '동네랭킹'
        ? '대결이 시작되면 동네 점수 순위가 실시간으로 집계돼요.'
        : '대결이 시작되면 개인 점수 순위가 실시간으로 집계돼요.';
    return <RankingEmptyState description={description} />;
  }

  return (
    <View>
      {tab === '동네랭킹'
        ? districts.map((item) => (
            <Ranking
              key={item.location_id}
              number={item.location_rank}
              location={formatLocationName(item.city_name, item.location_name)}
              count={item.location_score}
            />
          ))
        : persons.map((item) => (
            <Ranking
              key={item.user_id}
              number={item.user_rank}
              location={item.user_name}
              count={item.user_score}
              avatar={<UserCharacter userId={item.user_id} size={50} />}
            />
          ))}
    </View>
  );
}
