import DistrictBattleStatus from '@/components/feed/DistrictBattleStatus';
import FeedCard from '@/components/feed/FeedCard';
import FeedCardSkeleton from '@/components/feed/FeedCardSkeleton';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/header';
import Typography from '@/components/ui/Typography';
import { usePosts } from '@/hooks/post/usePosts';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const SKELETON_COUNT = 3;

export default function FeedScreen() {
  const { data: posts, isLoading, isError } = usePosts(1);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2xl px-xl pt-lg"
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <View className="flex flex-col gap-sm">
          <DistrictBattleStatus
            myTeam={{ name: '강서구', score: 99 }}
            opponentTeam={{ name: '영도구', score: 67 }}
          />
          <Button content="바로 참여" />
        </View>
        <View className="flex flex-col gap-md">
          {isLoading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <FeedCardSkeleton key={index} />
            ))
          ) : isError ? (
            <Typography variant="body2" className="py-2xl text-center text-gray-400">
              게시글을 불러오지 못했어요.
            </Typography>
          ) : (
            // TODO: 백엔드 Post 모델에 title·place·like_count·avatar 필드 추가 시 매핑 보강
            posts?.map((post) => (
              <FeedCard
                key={post.post_id}
                postId={post.post_id}
                author={{ name: post.user_name, avatarUrl: '' }}
                imageUrl={post.post_image}
                title=""
                place=""
                timeAgo={post.created_at}
                likeCount={0}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
