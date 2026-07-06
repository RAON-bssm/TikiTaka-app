import { useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import BattleSection from '@/components/ranking/BattleSection';
import RankingList from '@/components/ranking/RankingList';
import RankingTabs from '@/components/ranking/RankingTabs';
import SortFilter from '@/components/ranking/SortFilter';
import Header from '@/components/ui/header';
import {
  DISTRICT_RANKINGS,
  MATCHES,
  PERSONAL_RANKINGS,
  RANKING_SORTS,
  RANKING_TABS,
  type RankingSort,
  type RankingTab,
} from '@/constants/ranking';

export default function RankingScreen() {
  const [tab, setTab] = useState<RankingTab>('동네랭킹');
  const [sort, setSort] = useState<RankingSort>('가장 높은 순');

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
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
          <BattleSection matches={MATCHES} />
        </View>

        {/* 랭킹 — 전체폭 흰색 블록. 남는 세로 공간을 채워 하단까지 흰색이 이어지게 한다 */}
        <View className="grow gap-lg bg-gray-50 px-xl py-lg">
          <RankingTabs tabs={RANKING_TABS} selected={tab} onSelect={setTab} />
          <SortFilter sorts={RANKING_SORTS} selected={sort} onSelect={setSort} />
          <RankingList tab={tab} districts={DISTRICT_RANKINGS} persons={PERSONAL_RANKINGS} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
