import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BlockUserDialog from '@/components/block/BlockUserDialog';
import BattleSection from '@/components/ranking/BattleSection';
import MyRankingRow from '@/components/ranking/MyRankingRow';
import RankingEmptyState from '@/components/ranking/RankingEmptyState';
import RankingRow, { type RankingRowItem } from '@/components/ranking/RankingRow';
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
import { useMyInfo } from '@/hooks/user/useMyInfo';

const EMPTY_DESCRIPTION: Record<RankingTab, string> = {
  동네랭킹: '대결이 시작되면 동네 점수 순위가 실시간으로 집계돼요.',
  개인랭킹: '대결이 시작되면 개인 점수 순위가 실시간으로 집계돼요.',
};

export default function RankingScreen() {
  const [tab, setTab] = useState<RankingTab>('동네랭킹');
  const [blockTarget, setBlockTarget] = useState<{ userId: string; userName: string }>();

  const { data: myInfo } = useMyInfo();
  const battles = useCurrentBattles();
  const matchStage = useMatchStage();
  const locationRanking = useLocationRanking();
  const userRanking = useUserRanking();

  const rankingQuery = tab === '동네랭킹' ? locationRanking : userRanking;
  const districts = locationRanking.data?.location_ranking ?? [];
  const persons = userRanking.data?.user_ranking ?? [];
  const currentRows = tab === '동네랭킹' ? districts : persons;
  // 랭킹이 하나도 없으면 시즌 배지·내 순위는 의미가 없어 포디움 empty state만 보여준다.
  const isRankingEmpty = rankingQuery.isSuccess && currentRows.length === 0;

  const rows: RankingRowItem[] = !rankingQuery.isSuccess
    ? []
    : tab === '동네랭킹'
      ? districts.map((data) => ({ kind: 'district', key: `d${data.location_id}`, data }))
      : persons.map((data) => ({ kind: 'person', key: `p${data.user_id}`, data }));

  const header = (
    <View className="gap-2xl">
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

      <View className="gap-lg bg-white px-xl pb-lg pt-lg">
        <RankingTabs tabs={RANKING_TABS} selected={tab} onSelect={setTab} />
        {!isRankingEmpty &&
          (matchStage.isLoading ? (
            <Skeleton className="h-3xl w-full rounded-full" />
          ) : matchStage.isError ? (
            <ErrorRetry
              message="시즌 정보를 불러오지 못했어요."
              onRetry={() => matchStage.refetch()}
            />
          ) : (
            <StageBadge stage={matchStage.data} />
          ))}
        {!isRankingEmpty && tab === '개인랭킹' && userRanking.isSuccess && (
          <MyRankingRow myRanking={userRanking.data.my_ranking} />
        )}
      </View>
    </View>
  );

  const empty = (
    <View className="grow bg-white px-xl">
      {rankingQuery.isLoading ? (
        <Skeleton className="h-96 w-full rounded-sm" />
      ) : rankingQuery.isError ? (
        <ErrorRetry message="랭킹을 불러오지 못했어요." onRetry={() => rankingQuery.refetch()} />
      ) : (
        <RankingEmptyState description={EMPTY_DESCRIPTION[tab]} />
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        renderItem={({ item }) => (
          <RankingRow row={item} myUserId={myInfo?.user_id} onBlock={setBlockTarget} />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={<View className="h-lg" />}
        ListFooterComponentClassName={rows.length > 0 ? 'grow bg-white' : 'bg-white'}
        contentContainerClassName="grow"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      />
      <BlockUserDialog target={blockTarget} onClose={() => setBlockTarget(undefined)} />
    </SafeAreaView>
  );
}
