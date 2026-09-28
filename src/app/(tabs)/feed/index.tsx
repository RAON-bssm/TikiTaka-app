import CurrentBattleCard from '@/components/feed/CurrentBattleCard';
import PostList from '@/components/feed/PostList';
import Header from '@/components/ui/Header';
import { palette } from '@/constants/colors';
import { useCurrentBattle } from '@/hooks/match/useCurrentBattle';
import { useCurrentBoardPosts } from '@/hooks/post/useCurrentBoardPosts';
import { useState } from 'react';
import { RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedScreen() {
  const posts = useCurrentBoardPosts();
  const battle = useCurrentBattle();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([posts.refetch(), battle.refetch()]);
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
        <CurrentBattleCard state={battle} />
        <PostList state={posts} />
      </ScrollView>
    </SafeAreaView>
  );
}
