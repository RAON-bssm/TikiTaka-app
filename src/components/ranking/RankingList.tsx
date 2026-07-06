import { View } from 'react-native';

import Character from '@/components/character/Character';
import Ranking from '@/components/ui/Ranking';
import type { DistrictRanking, PersonalRanking, RankingTab } from '@/constants/ranking';

interface Props {
  /** 현재 탭. 동네랭킹이면 지역 목록, 개인랭킹이면 아바타 목록을 렌더한다. */
  tab: RankingTab;
  districts: DistrictRanking[];
  persons: PersonalRanking[];
}

/** 탭에 따라 동네/개인 랭킹 행을 렌더한다. */
export default function RankingList({ tab, districts, persons }: Props) {
  return (
    <View>
      {tab === '동네랭킹'
        ? districts.map((item) => (
            <Ranking
              key={item.rank}
              number={item.rank}
              location={item.location}
              count={item.score}
            />
          ))
        : persons.map((item) => (
            <Ranking
              key={item.rank}
              number={item.rank}
              location={item.name}
              address={item.address}
              count={item.score}
              avatar={<Character config={item.character} size={50} />}
            />
          ))}
    </View>
  );
}
