import CurrentBattleCard from '@/components/feed/CurrentBattleCard';
import { PostFlatList } from '@/components/feed/PostList';
import Header from '@/components/ui/Header';
import { palette } from '@/constants/colors';
import { useCurrentBattle } from '@/hooks/match/useCurrentBattle';
import { useCurrentBoardPosts } from '@/hooks/post/useCurrentBoardPosts';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';
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
      <PostFlatList
        state={posts}
        header={
          <View className="gap-2xl">
            <Header />
            <CurrentBattleCard state={battle} />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={palette.primary[600]}
            colors={[palette.primary[600]]}
          />
        }
      />
    </SafeAreaView>
  );
}
