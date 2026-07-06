import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import MatchCard from '@/components/ui/MatchCard';
import Typography from '@/components/ui/Typography';
import type { Match } from '@/constants/ranking';

/** "현재 진행 중인 대결" 섹션 — 대결 카드 가로 스크롤. */
export default function BattleSection({ matches }: { matches: Match[] }) {
  return (
    <View className="gap-md">
      <Typography variant="h4" className="text-gray-800">
        현재 진행 중인 대결
      </Typography>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-md"
      >
        {matches.map((match) => (
          <MatchCard key={match.id} left={match.left} right={match.right} />
        ))}
      </ScrollView>
    </View>
  );
}
