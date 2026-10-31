import { type ReactElement, useState } from 'react';
import { FlatList, type RefreshControlProps, View } from 'react-native';

import FeedCard from '@/components/feed/FeedCard';
import FeedCardSkeleton from '@/components/feed/FeedCardSkeleton';
import PostDeleteDialog from '@/components/feed/PostDeleteDialog';
import PostEditDialog, { type EditingPost } from '@/components/feed/PostEditDialog';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Typography from '@/components/ui/Typography';
import type { CurrentBoardPostsState } from '@/hooks/post/useCurrentBoardPosts';
import { useMyInfo } from '@/hooks/user/useMyInfo';
import { formatRelativeTime } from '@/hooks/useRelativeTime';
import type { Post } from '@/types/post';

const SKELETON_COUNT = 3;

const Separator = () => <View className="h-md" />;

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

/** 게시물이 없을 때의 로딩·실패·빈 상태. 그릴 게시물이 있으면 null. */
const PostListStatus = ({ state, limit }: Props) => {
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
  return null;
};

/** 카드 ⋮ 메뉴의 수정·삭제 다이얼로그 상태. 목록마다 하나씩 둔다. */
function usePostActions() {
  const { data: myInfo } = useMyInfo();
  const [deletingPostId, setDeletingPostId] = useState<string>();
  const [editingPost, setEditingPost] = useState<EditingPost>();

  const renderCard = (post: Post) => (
    <FeedCard
      key={post.post_id}
      postId={post.post_id}
      author={{ name: post.user_name, userId: post.user_id }}
      imageUrl={post.post_image}
      title={post.content}
      place={post.location}
      timeAgo={formatRelativeTime(post.created_at)}
      likeCount={post.like_count}
      liked={post.liked_by_me}
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
  );

  const dialogs = (
    <>
      <PostEditDialog post={editingPost} onClose={() => setEditingPost(undefined)} />
      <PostDeleteDialog postId={deletingPostId} onClose={() => setDeletingPostId(undefined)} />
    </>
  );

  return { renderCard, dialogs };
}

/** 상태를 prop으로 받는 이유: 화면이 당겨서 새로고침에 `refetch`를 엮는다. */
export default function PostList({ state, limit }: Props) {
  const { renderCard, dialogs } = usePostActions();
  const status = <PostListStatus state={state} limit={limit} />;

  if (state.isLoading || state.isError || state.posts.length === 0) {
    return status;
  }

  return (
    <View className="flex flex-col gap-md">
      {state.posts.slice(0, limit).map(renderCard)}
      {dialogs}
    </View>
  );
}

interface FlatProps {
  state: CurrentBoardPostsState;
  header: ReactElement;
  refreshControl: ReactElement<RefreshControlProps>;
}

/**
 * 피드 화면 전체 목록. 카드마다 캐릭터·이미지 URL을 따로 요청하므로, 게시물이 많아도
 * 화면에 보이는 카드만 그리도록 FlatList로 그린다.
 */
export function PostFlatList({ state, header, refreshControl }: FlatProps) {
  const { renderCard, dialogs } = usePostActions();
  const posts = state.isLoading || state.isError ? [] : state.posts;

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(post) => post.post_id}
        renderItem={({ item }) => renderCard(item)}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        ListHeaderComponentClassName="pb-2xl"
        ListEmptyComponent={<PostListStatus state={state} />}
        contentContainerClassName="px-xl pb-lg pt-lg"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      />
      {dialogs}
    </>
  );
}
