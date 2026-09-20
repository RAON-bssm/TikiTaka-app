import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import MatchCard from '@/components/ui/MatchCard';
import Typography from '@/components/ui/Typography';
import type { CurrentBattle } from '@/hooks/match/useCurrentBattles';

export default function BattleSection({ battles }: { battles: CurrentBattle[] }) {
  if (battles.length === 0) {
    return null;
  }

  return (
    <View className="gap-lg">
      <Typography variant="h3" className="text-gray-800">
        현재 진행 중인 대결
      </Typography>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-md"
      >
        {battles.map((battle) => (
          <MatchCard key={battle.boardId} {...battle} />
        ))}
      </ScrollView>
    </View>
  );
}
