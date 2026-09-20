import { View } from 'react-native';

import Character from '@/components/character/Character';
import Ranking from '@/components/ui/Ranking';
import Typography from '@/components/ui/Typography';
import { formatLocationName } from '@/constants/location';
import type { RankingTab } from '@/constants/ranking';
import { pickRankingCharacter } from '@/constants/ranking';
import type { LocationRanking, UserRanking } from '@/types/ranking';

interface Props {
  /** 현재 탭. 동네랭킹이면 지역 목록, 개인랭킹이면 아바타 목록을 렌더한다. */
  tab: RankingTab;
  districts: LocationRanking[];
  persons: UserRanking[];
}

/**
 * 탭에 따라 동네/개인 랭킹 행을 렌더한다.
 *
 * 개인랭킹은 서버가 아바타 정보를 내려주지 않으므로, user_id로 시드를 고정해
 * 항상 같은 캐릭터가 뜨도록 `pickRankingCharacter`로 대체한다.
 */
export default function RankingList({ tab, districts, persons }: Props) {
  const rows = tab === '동네랭킹' ? districts : persons;

  if (rows.length === 0) {
    return (
      <Typography variant="body2" className="px-md py-3xl text-center text-gray-400">
        {tab === '동네랭킹'
          ? '아직 점수를 올린 동네가 없어요.'
          : '아직 점수를 올린 참가자가 없어요.'}
      </Typography>
    );
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
              avatar={<Character config={pickRankingCharacter(item.user_id)} size={50} />}
            />
          ))}
    </View>
  );
}
