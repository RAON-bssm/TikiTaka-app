import { useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import BattleSection from '@/components/ranking/BattleSection';
import MyRankingRow from '@/components/ranking/MyRankingRow';
import RankingList from '@/components/ranking/RankingList';
import RankingTabs from '@/components/ranking/RankingTabs';
import SortFilter from '@/components/ranking/SortFilter';
import StageBadge from '@/components/ranking/StageBadge';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Header from '@/components/ui/Header';
import {
  RANKING_SORTS,
  RANKING_TABS,
  type RankingSort,
  type RankingTab,
} from '@/constants/ranking';
import { useMatchResult } from '@/hooks/match/useMatchResult';
import { useMatchStage } from '@/hooks/match/useMatchStage';
import { useLocationRanking } from '@/hooks/ranking/useLocationRanking';
import { useUserRanking } from '@/hooks/ranking/useUserRanking';

/** score가 높은 항목을 앞에 둘지 뒤에 둘지만 바꾸는 정렬. 원본 배열은 건드리지 않는다. */
function sortByScore<T>(items: T[], sort: RankingSort, getScore: (item: T) => number): T[] {
  const direction = sort === '가장 높은 순' ? -1 : 1;
  return [...items].sort((a, b) => (getScore(a) - getScore(b)) * direction);
}

export default function RankingScreen() {
  const [tab, setTab] = useState<RankingTab>('동네랭킹');
  const [sort, setSort] = useState<RankingSort>('가장 높은 순');

  const matchResult = useMatchResult();
  const matchStage = useMatchStage();
  const locationRanking = useLocationRanking();
  const userRanking = useUserRanking();

  const rankingQuery = tab === '동네랭킹' ? locationRanking : userRanking;
  const districts = sortByScore(
    locationRanking.data?.location_ranking ?? [],
    sort,
    (item) => item.location_score,
  );
  const persons = sortByScore(
    userRanking.data?.user_ranking ?? [],
    sort,
    (item) => item.user_score,
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow gap-2xl"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* 상단(헤더 + 대결)은 회색 배경 위에 좌우 여백만 준다 */}
        <View className="gap-2xl px-xl pt-lg">
          <Header />
          {matchResult.isLoading ? (
            <Skeleton className="h-32 w-full rounded-sm" />
          ) : matchResult.isError ? (
            <ErrorRetry
              message="대결 결과를 불러오지 못했어요."
              onRetry={() => matchResult.refetch()}
            />
          ) : (
            <BattleSection matches={matchResult.data?.match ?? []} />
          )}
        </View>

        {/* 랭킹 — 전체폭 흰색 블록. 남는 세로 공간을 채워 하단까지 흰색이 이어지게 한다 */}
        <View className="grow gap-lg bg-white px-xl py-lg">
          <RankingTabs tabs={RANKING_TABS} selected={tab} onSelect={setTab} />
          <StageBadge stage={matchStage.data} />
          {tab === '개인랭킹' && userRanking.isSuccess && (
            <MyRankingRow myRanking={userRanking.data.my_ranking} />
          )}
          <SortFilter sorts={RANKING_SORTS} selected={sort} onSelect={setSort} />
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
