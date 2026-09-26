import { View } from 'react-native';

import FeedCard from '@/components/feed/FeedCard';
import FeedCardSkeleton from '@/components/feed/FeedCardSkeleton';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Typography from '@/components/ui/Typography';
import { pickRankingCharacter } from '@/constants/ranking';
import type { CurrentBoardPostsState } from '@/hooks/post/useCurrentBoardPosts';
import { formatRelativeTime } from '@/hooks/useRelativeTime';

const SKELETON_COUNT = 3;

interface Props {
  state: CurrentBoardPostsState;
  /** 홈 미리보기처럼 앞에서 몇 개만 보여줄 때. */
  limit?: number;
}

const EmptyPosts = ({ message }: { message: string }) => (
  <View className="w-full items-center rounded-md border border-gray-100 bg-white p-lg">
    <Typography variant="body3" className="text-center text-gray-500">
      {message}
    </Typography>
  </View>
);

/** 상태를 prop으로 받는 이유: 화면이 당겨서 새로고침에 `refetch`를 엮는다. */
export default function PostList({ state, limit }: Props) {
  if (state.isLoading) {
    return (
      <View className="flex flex-col gap-md">
        {Array.from({ length: Math.min(limit ?? SKELETON_COUNT, SKELETON_COUNT) }).map(
          (_, index) => (
            <FeedCardSkeleton key={index} />
          ),
        )}
      </View>
    );
  }

  if (state.isError) {
    return <ErrorRetry onRetry={state.refetch} />;
  }

  if (!state.board) {
    return <EmptyPosts message="진행 중인 라운드가 없어요" />;
  }

  if (state.posts.length === 0) {
    return <EmptyPosts message="아직 올라온 게시글이 없어요" />;
  }

  return (
    <View className="flex flex-col gap-md">
      {/* TODO: 백엔드 Post 모델에 like_count·avatar 필드 추가 시 매핑 보강 */}
      {state.posts.slice(0, limit).map((post) => (
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
      ))}
    </View>
  );
}
