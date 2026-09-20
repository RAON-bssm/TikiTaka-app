import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import MatchCard from '@/components/ui/MatchCard';
import Typography from '@/components/ui/Typography';
import type { CurrentBattle } from '@/hooks/match/useCurrentBattles';

export default function BattleSection({ battles }: { battles: CurrentBattle[] }) {
  return (
    <View className="gap-lg">
      <Typography variant="h3" className="text-gray-800">
        현재 진행 중인 대결
      </Typography>
      {battles.length === 0 ? (
        <Typography variant="body2" className="py-xl text-center text-gray-400">
          진행 중인 대결이 없어요. 다음 라운드를 기다려주세요
        </Typography>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-md"
        >
          {battles.map((battle) => (
            <MatchCard key={battle.boardId} {...battle} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
