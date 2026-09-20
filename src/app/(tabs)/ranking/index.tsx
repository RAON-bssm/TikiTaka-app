import { useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import BattleSection from '@/components/ranking/BattleSection';
import MyRankingRow from '@/components/ranking/MyRankingRow';
import RankingList from '@/components/ranking/RankingList';
import RankingTabs from '@/components/ranking/RankingTabs';
import StageBadge from '@/components/ranking/StageBadge';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Header from '@/components/ui/Header';
import { RANKING_TABS, type RankingTab } from '@/constants/ranking';
import { useCurrentBattles } from '@/hooks/match/useCurrentBattles';
import { useMatchStage } from '@/hooks/match/useMatchStage';
import { useLocationRanking } from '@/hooks/ranking/useLocationRanking';
import { useUserRanking } from '@/hooks/ranking/useUserRanking';

export default function RankingScreen() {
  const [tab, setTab] = useState<RankingTab>('동네랭킹');

  const battles = useCurrentBattles();
  const matchStage = useMatchStage();
  const locationRanking = useLocationRanking();
  const userRanking = useUserRanking();

  const rankingQuery = tab === '동네랭킹' ? locationRanking : userRanking;
  const districts = locationRanking.data?.location_ranking ?? [];
  const persons = userRanking.data?.user_ranking ?? [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow gap-2xl"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <View className="gap-2xl px-xl pt-lg">
          <Header />
          {battles.isLoading ? (
            <Skeleton className="h-32 w-full rounded-sm" />
          ) : battles.isError ? (
            <ErrorRetry message="대결 상황을 불러오지 못했어요." onRetry={battles.refetch} />
          ) : (
            <BattleSection battles={battles.battles} />
          )}
        </View>

        <View className="grow gap-lg bg-white px-xl py-lg">
          <RankingTabs tabs={RANKING_TABS} selected={tab} onSelect={setTab} />
          <StageBadge stage={matchStage.data} />
          {tab === '개인랭킹' && userRanking.isSuccess && (
            <MyRankingRow myRanking={userRanking.data.my_ranking} />
          )}
          {rankingQuery.isLoading ? (
            <Skeleton className="h-96 w-full rounded-sm" />
          ) : rankingQuery.isError ? (
            <ErrorRetry
              message="랭킹을 불러오지 못했어요."
              onRetry={() => rankingQuery.refetch()}
            />
          ) : (
            <RankingList tab={tab} districts={districts} persons={persons} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
