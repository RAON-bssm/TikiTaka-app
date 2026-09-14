import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import MatchCard from '@/components/ui/MatchCard';
import Typography from '@/components/ui/Typography';
import type { MatchResult } from '@/types/match';

/**
 * "지난 라운드 대결 결과" 섹션 — 대결 카드 가로 스크롤.
 *
 * 직전에 종료된 라운드가 없으면 `matches`가 빈 배열이다.
 */
export default function BattleSection({ matches }: { matches: MatchResult[] }) {
  if (matches.length === 0) {
    return null;
  }

  return (
    <View className="gap-lg">
      <Typography variant="h3" className="text-gray-800">
        지난 라운드 대결 결과
      </Typography>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-md"
      >
        {matches.map((match) => (
          <MatchCard key={match.match_id} {...match} />
        ))}
      </ScrollView>
    </View>
  );
}
