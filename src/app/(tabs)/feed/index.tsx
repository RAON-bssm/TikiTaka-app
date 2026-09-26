import CurrentBattleCard from '@/components/feed/CurrentBattleCard';
import FeedCard from '@/components/feed/FeedCard';
import FeedCardSkeleton from '@/components/feed/FeedCardSkeleton';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Header from '@/components/ui/Header';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { pickRankingCharacter } from '@/constants/ranking';
import { useCurrentBattle } from '@/hooks/match/useCurrentBattle';
import { useBoards } from '@/hooks/post/useBoards';
import { usePosts } from '@/hooks/post/usePosts';
import { formatRelativeTime } from '@/hooks/useRelativeTime';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const SKELETON_COUNT = 3;

const EmptyFeed = ({ message }: { message: string }) => (
  <View className="w-full items-center rounded-md border border-gray-100 bg-white p-lg">
    <Typography variant="body3" className="text-center text-gray-500">
      {message}
    </Typography>
  </View>
);

export default function FeedScreen() {
  const boards = useBoards();
  // 서버가 내 매치를 맨 앞에 두므로, 내 매치가 없으면 다른 동네 게시판을 구경하게 된다.
  const board = boards.data?.[0];
  const posts = usePosts(board?.board_id);
  const battle = useCurrentBattle();

  // TODO: 서버 참여 API 연동 시 useMutation으로 대체. 지금은 UI 반응만 목업.
  const [joined, setJoined] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // 게시판이 바뀌면 usePosts가 새 키로 다시 받는다. 게시판이 없을 때 refetch하면 skipToken 에러가 난다.
      await Promise.all([boards.refetch(), board ? posts.refetch() : undefined, battle.refetch()]);
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
        <View className="flex flex-col gap-md">
          {boards.isLoading || posts.isLoading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <FeedCardSkeleton key={index} />
            ))
          ) : boards.isError ? (
            <ErrorRetry onRetry={boards.refetch} />
          ) : !board ? (
            <EmptyFeed message="진행 중인 라운드가 없어요" />
          ) : posts.isError ? (
            <ErrorRetry onRetry={posts.refetch} />
          ) : !posts.data?.length ? (
            <EmptyFeed message="아직 올라온 게시글이 없어요" />
          ) : (
            // TODO: 백엔드 Post 모델에 like_count·avatar 필드 추가 시 매핑 보강
            posts.data.map((post) => (
              <FeedCard
                key={post.post_id}
                postId={post.post_id}
                author={{ name: post.user_name, character: pickRankingCharacter(post.post_id) }}
                imageUrl={post.post_image}
                title={post.content}
                place={post.location}
                timeAgo={formatRelativeTime(post.created_at)}
                likeCount={0}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
