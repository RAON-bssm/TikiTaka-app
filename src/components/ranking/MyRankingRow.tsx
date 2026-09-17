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
    <View className="border-b border-gray-100">
      <Typography variant="caption" className="px-md text-gray-400">
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
        <Typography variant="body2" className="px-md py-xl text-gray-400">
          이번 라운드에 아직 참여하지 않았어요.
        </Typography>
      )}
    </View>
  );
}
