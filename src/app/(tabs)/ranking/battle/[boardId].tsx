import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostFlatList } from '@/components/feed/PostList';
import BackButton from '@/components/ui/BackButton';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import MatchCard from '@/components/ui/MatchCard';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { useCurrentBattles } from '@/hooks/match/useCurrentBattles';
import { useBoardFeed } from '@/hooks/post/useCurrentBoardFeed';

export default function BattlePostsScreen() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const id = Number(boardId);
  const posts = useBoardFeed(id);
  const battles = useCurrentBattles();
  const battle = battles.battles.find((item) => item.boardId === id);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([posts.refetch(), battles.refetch()]);
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
            <BackButton title="동네 대결" />
            {battles.isLoading ? (
              <Skeleton className="h-32 w-full rounded-md" />
            ) : battles.isError ? (
              <ErrorRetry message="대결 상황을 불러오지 못했어요." onRetry={battles.refetch} />
            ) : battle ? (
              <View className="gap-md">
                <MatchCard {...battle} fullWidth />
                {posts.board?.mission && (
                  <Typography variant="body3" className="text-center text-gray-500">
                    미션: {posts.board.mission}
                  </Typography>
                )}
              </View>
            ) : null}
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
