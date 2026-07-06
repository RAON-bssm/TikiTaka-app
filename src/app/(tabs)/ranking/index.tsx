import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import FilterIcon from '@/assets/icons/filter.svg';
import Header from '@/components/ui/header';
import MatchCard, { type MatchTeam } from '@/components/ui/MatchCard';
import Ranking from '@/components/ui/Ranking';
import Typography from '@/components/ui/Typography';

const TABS = ['동네랭킹', '개인랭킹'] as const;
type Tab = (typeof TABS)[number];

const SORTS = ['가장 높은 순', '가장 낮은 순'] as const;
type Sort = (typeof SORTS)[number];

type Match = { id: number; left: MatchTeam; right: MatchTeam };

// TODO: 서버 연동 시 TanStack Query로 대체
const MATCHES: Match[] = [
  { id: 1, left: { name: '사상구', score: 80 }, right: { name: '영도구', score: 67 } },
  { id: 2, left: { name: '사상구', score: 67 }, right: { name: '영도구', score: 99 } },
  { id: 3, left: { name: '사상구', score: 80 }, right: { name: '영도구', score: 67 } },
];

// TODO: 서버 연동 시 TanStack Query로 대체
const RANKINGS = Array.from({ length: 9 }, (_, i) => ({
  rank: i + 1,
  location: '부산시 사상구',
  score: 580,
}));

export default function RankingScreen() {
  const [tab, setTab] = useState<Tab>('동네랭킹');
  const [sort, setSort] = useState<Sort>('가장 높은 순');

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2xl pb-2xl"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-xl pt-lg">
          <Header />
        </View>

        {/* 현재 진행 중인 대결 */}
        <View className="gap-sm">
          <Typography variant="h4" className="px-xl text-gray-800">
            현재 진행 중인 대결
          </Typography>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-sm px-xl"
          >
            {MATCHES.map((match) => (
              <MatchCard key={match.id} left={match.left} right={match.right} />
            ))}
          </ScrollView>
        </View>

        {/* 랭킹 */}
        <View className="gap-lg bg-gray-50 px-xl py-lg">
          {/* 종류 탭 */}
          <View className="flex-row">
            {TABS.map((label) => {
              const active = label === tab;
              return (
                <Pressable
                  key={label}
                  onPress={() => setTab(label)}
                  className={`items-center justify-center p-sm ${
                    active ? 'border-b border-primary-600' : ''
                  }`}
                >
                  <Typography variant="h3" className={active ? 'text-gray-800' : 'text-gray-500'}>
                    {label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row items-center gap-xs">
            <View className="size-8 items-center justify-center rounded-full bg-gray-100">
              <FilterIcon width={20} height={20} color="#6E7D94" />
            </View>
            {SORTS.map((label) => {
              const active = label === sort;
              return (
                <Pressable
                  key={label}
                  onPress={() => setSort(label)}
                  className={`rounded-full px-lg py-sm ${active ? 'bg-primary-100' : 'bg-gray-100'}`}
                >
                  <Typography
                    variant="body3"
                    className={active ? 'text-primary-600' : 'text-gray-600'}
                  >
                    {label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>

          <View>
            {RANKINGS.map((item) => (
              <Ranking
                key={item.rank}
                number={item.rank}
                location={item.location}
                count={item.score}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
