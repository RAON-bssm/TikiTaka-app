import { View } from 'react-native';

import Character from '@/components/character/Character';
import Ranking from '@/components/ui/Ranking';
import Typography from '@/components/ui/Typography';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';
import type { UserRanking } from '@/types/ranking';

interface Props {
  myRanking?: UserRanking;
}

export default function MyRankingRow({ myRanking }: Props) {
  const { config } = useCharacterConfig();

  return (
    <View className="rounded-md bg-primary-100">
      <Typography variant="body3" className="px-md pt-md text-gray-600">
        내 순위
      </Typography>
      {myRanking ? (
        <Ranking
          number={myRanking.user_rank}
          location={myRanking.user_name}
          count={myRanking.user_score}
          avatar={<Character config={config} size={50} />}
        />
      ) : (
        <Typography variant="body2" className="px-md py-lg text-gray-600">
          이번 라운드에 아직 참여하지 않았어요.
        </Typography>
      )}
    </View>
  );
}
