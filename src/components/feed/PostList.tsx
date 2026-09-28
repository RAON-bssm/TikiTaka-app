import { useState } from 'react';
import { View } from 'react-native';

import FeedCard from '@/components/feed/FeedCard';
import FeedCardSkeleton from '@/components/feed/FeedCardSkeleton';
import PostDeleteDialog from '@/components/feed/PostDeleteDialog';
import PostEditDialog, { type EditingPost } from '@/components/feed/PostEditDialog';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Typography from '@/components/ui/Typography';
import type { CurrentBoardPostsState } from '@/hooks/post/useCurrentBoardPosts';
import { useMyInfo } from '@/hooks/user/useMyInfo';
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
  const { data: myInfo } = useMyInfo();
  const [deletingPostId, setDeletingPostId] = useState<string>();
  const [editingPost, setEditingPost] = useState<EditingPost>();

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
      {state.posts.slice(0, limit).map((post) => (
        <FeedCard
          key={post.post_id}
          postId={post.post_id}
          author={{ name: post.user_name, userId: post.user_id }}
          imageUrl={post.post_image}
          title={post.content}
          place={post.location}
          timeAgo={formatRelativeTime(post.created_at)}
          likeCount={post.like_count}
          menuItems={
            post.user_id === myInfo?.user_id
              ? [
                  {
                    label: '수정하기',
                    onPress: () => setEditingPost({ postId: post.post_id, content: post.content }),
                  },
                  {
                    label: '삭제하기',
                    destructive: true,
                    onPress: () => setDeletingPostId(post.post_id),
                  },
                ]
              : undefined
          }
        />
      ))}
      <PostEditDialog post={editingPost} onClose={() => setEditingPost(undefined)} />
      <PostDeleteDialog postId={deletingPostId} onClose={() => setDeletingPostId(undefined)} />
    </View>
  );
}
