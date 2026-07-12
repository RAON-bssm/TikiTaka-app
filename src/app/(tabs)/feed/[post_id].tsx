import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import AiScoreCard from '@/components/feed/AiScoreCard';
import PostAuthor from '@/components/feed/PostAuthor';
import PostDetailSkeleton from '@/components/feed/PostDetailSkeleton';
import PostImage from '@/components/feed/PostImage';
import PostTitleRow from '@/components/feed/PostTitleRow';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Header from '@/components/ui/header';
import { palette } from '@/constants/colors';
import { usePostDetail } from '@/hooks/post/usePostDetail';

export default function PostDetailScreen() {
  const { post_id } = useLocalSearchParams<{ post_id: string }>();
  const { data: post, isLoading, isError, refetch, isRefetching } = usePostDetail(post_id);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2xl px-xl pt-lg"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={palette.primary[600]}
            colors={[palette.primary[600]]}
          />
        }
      >
        <Header />

        {isLoading ? (
          <PostDetailSkeleton />
        ) : isError || !post ? (
          <ErrorRetry onRetry={refetch} />
        ) : (
          // TODO: 백엔드 Post 모델에 place·title·like_count·avatar·ai_comment 필드 추가 시 매핑 보강
          <>
            <View className="flex flex-col gap-lg">
              <PostAuthor name={post.user_name} profile="" place="" createdAt={post.created_at} />
              <PostImage uri={post.post_image} />
            </View>

            <PostTitleRow authorName={post.user_name} title="" likeCount={0} />

            <AiScoreCard score={post.score} comment="" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
