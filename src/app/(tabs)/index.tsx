import CurrentBattleCard from '@/components/feed/CurrentBattleCard';
import PostList from '@/components/feed/PostList';
import Banner from '@/components/ui/banner/Banner';
import Header from '@/components/ui/Header';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { useCurrentBattle } from '@/hooks/match/useCurrentBattle';
import { useAllPostsFeed } from '@/hooks/post/useAllPostsFeed';
import { useCurrentBoardPosts } from '@/hooks/post/useCurrentBoardPosts';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const PREVIEW_COUNT = 3;

function SectionTitle({ title, href }: { title: string; href: Href }) {
  const router = useRouter();
  return (
    <View className="flex flex-row justify-between w-full items-center">
      <Typography variant="h3" className="text-gray-800">
        {title}
      </Typography>
      <Pressable onPress={() => router.push(href)} hitSlop={8}>
        <Typography variant="body2" className="text-gray-500">
          더보기
        </Typography>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const battle = useCurrentBattle();
  const posts = useCurrentBoardPosts(PREVIEW_COUNT);
  const allPosts = useAllPostsFeed(PREVIEW_COUNT);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([posts.refetch(), allPosts.refetch(), battle.refetch()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2xl px-xl pt-lg"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={palette.primary[600]}
            colors={[palette.primary[600]]}
          />
        }
      >
        <Header />

        <Banner />

        <CurrentBattleCard state={battle} />

        <View className="flex flex-col gap-md">
          <SectionTitle title="동네 훔쳐보기" href="/feed" />
          <PostList state={posts} limit={PREVIEW_COUNT} />
        </View>

        <View className="flex flex-col gap-md pb-lg">
          <SectionTitle title="전체 게시글" href="/feed/all" />
          <PostList state={allPosts} limit={PREVIEW_COUNT} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
