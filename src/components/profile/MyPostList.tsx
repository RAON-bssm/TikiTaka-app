import { useState } from 'react';
import { View } from 'react-native';

import FeedCard from '@/components/feed/FeedCard';
import FeedCardSkeleton from '@/components/feed/FeedCardSkeleton';
import PostDeleteDialog from '@/components/feed/PostDeleteDialog';
import PostEditDialog, { type EditingPost } from '@/components/feed/PostEditDialog';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Typography from '@/components/ui/Typography';
import { getPostReviewNotice } from '@/constants/post';
import { useMyPosts } from '@/hooks/post/useMyPosts';
import { formatRelativeTime } from '@/hooks/useRelativeTime';
import { useMyInfo } from '@/hooks/user/useMyInfo';

const SKELETON_COUNT = 2;
// 화면 첫 로드 때 바로 보이는 카드 수만큼만 이미지 로딩 우선순위를 올린다.
const HIGH_PRIORITY_COUNT = 2;

export default function MyPostList() {
  const { data: posts, isLoading, isError, refetch } = useMyPosts();
  // 응답에 작성자 정보가 없어(항상 본인 글) 이름·캐릭터는 내 정보로 채운다.
  const { data: myInfo } = useMyInfo();
  const [deletingPostId, setDeletingPostId] = useState<string>();
  const [editingPost, setEditingPost] = useState<EditingPost>();

  if (isLoading) {
    return (
      <View className="flex flex-col gap-md">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <FeedCardSkeleton key={index} />
        ))}
      </View>
    );
  }

  if (isError || !posts) {
    return <ErrorRetry message="게시물을 불러오지 못했어요." onRetry={refetch} />;
  }

  if (posts.length === 0) {
    return (
      <View className="w-full items-center rounded-md border border-gray-100 bg-white p-lg">
        <Typography variant="body3" className="text-center text-gray-500">
          아직 올린 게시물이 없어요
        </Typography>
      </View>
    );
  }

  return (
    <View className="flex flex-col gap-md">
      {posts.map((post, index) => (
        <FeedCard
          key={post.post_id}
          postId={post.post_id}
          authorName={myInfo?.user_name ?? ''}
          authorUserId={myInfo?.user_id}
          imageKey={post.post_image}
          imageUrl={post.post_image_url}
          fallbackToViewUrl
          title={post.content}
          place={post.location}
          timeAgo={formatRelativeTime(post.created_at)}
          // 심사가 끝나지 않은 글은 좋아요가 404, 수정이 409라 숨기고 점수 대신 상태를 붙인다.
          likeCount={post.status === 'DONE' ? post.like_count : undefined}
          liked={post.liked_by_me}
          badge={post.status === 'DONE' ? undefined : getPostReviewNotice(post.status).label}
          isMine
          canEdit={post.status === 'DONE'}
          onEditPress={setEditingPost}
          onDeletePress={setDeletingPostId}
          imagePriority={index < HIGH_PRIORITY_COUNT ? 'high' : undefined}
        />
      ))}
      <PostEditDialog post={editingPost} onClose={() => setEditingPost(undefined)} />
      <PostDeleteDialog postId={deletingPostId} onClose={() => setDeletingPostId(undefined)} />
    </View>
  );
}
