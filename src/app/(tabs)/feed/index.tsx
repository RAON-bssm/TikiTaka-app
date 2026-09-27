import CurrentBattleCard from '@/components/feed/CurrentBattleCard';
import PostList from '@/components/feed/PostList';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import { palette } from '@/constants/colors';
import { useCurrentBattle } from '@/hooks/match/useCurrentBattle';
import { useCurrentBoardPosts } from '@/hooks/post/useCurrentBoardPosts';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedScreen() {
  const posts = useCurrentBoardPosts();
  const battle = useCurrentBattle();

  // TODO: 서버 참여 API 연동 시 useMutation으로 대체. 지금은 UI 반응만 목업.
  const [joined, setJoined] = useState(false);
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
        <View className="flex flex-col gap-sm">
          <CurrentBattleCard state={battle} />
          <Button
            content={joined ? '참여 중' : '바로 참여'}
            variant={joined ? 'light' : 'primary'}
            onclick={() => setJoined(true)}
          />
        </View>
        <PostList state={posts} />
      </ScrollView>
    </SafeAreaView>
  );
}
