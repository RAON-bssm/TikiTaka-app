import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
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
        <View className="h-36 items-center justify-center">
          <Typography variant="body2" className="text-center text-gray-400">
            진행 중인 대결이 없어요. 다음 라운드를 기다려주세요
          </Typography>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-md"
        >
          {battles.map((battle) => (
            <Pressable
              key={battle.boardId}
              onPress={() =>
                router.push({
                  pathname: '/ranking/battle/[boardId]',
                  params: { boardId: String(battle.boardId) },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`${battle.team1.name} 대 ${battle.team2.name} 대결 게시물 보기`}
              className="active:opacity-80"
            >
              <MatchCard {...battle} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
