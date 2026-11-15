import { type ReactElement, useState } from 'react';
import { ActivityIndicator, FlatList, type RefreshControlProps, View } from 'react-native';

import FeedCard from '@/components/feed/FeedCard';
import FeedCardSkeleton from '@/components/feed/FeedCardSkeleton';
import PostDeleteDialog from '@/components/feed/PostDeleteDialog';
import PostEditDialog, { type EditingPost } from '@/components/feed/PostEditDialog';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import type { CurrentBoardFeedState } from '@/hooks/post/useCurrentBoardFeed';
import type { CurrentBoardPostsState } from '@/hooks/post/useCurrentBoardPosts';
import { useMyInfo } from '@/hooks/user/useMyInfo';
import { formatRelativeTime } from '@/hooks/useRelativeTime';
import type { Post } from '@/types/post';

const SKELETON_COUNT = 3;
// 화면 첫 로드 때 바로 보이는 카드 수만큼만 이미지 로딩 우선순위를 올린다.
const HIGH_PRIORITY_COUNT = 2;

// 카드 하나가 이미지·캐릭터 합성까지 있어 기본값(초기 10장, windowSize 21)은 과하다.
const INITIAL_NUM_TO_RENDER = 6;
const MAX_TO_RENDER_PER_BATCH = 6;
const WINDOW_SIZE = 7;

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

  // 본인 글이면 수정·삭제 메뉴를 보여준다. setEditingPost·setDeletingPostId(useState setter)를
  // 그대로 넘겨야 매 렌더마다 새 함수가 안 만들어져 FeedCard의 React.memo가 의미 있다.
  const isMine = (post: Post) => post.user_id === myInfo?.user_id;

  const renderCard = (post: Post, index: number) => (
    <FeedCard
      key={post.post_id}
      postId={post.post_id}
      authorName={post.user_name}
      authorUserId={post.user_id}
      authorEquipment={post.user_equipment}
      // 썸네일이 없는 글은 서버가 원본 key·URL을 그대로 짝지어 주므로 분기 없이 이 둘만 쓰면 된다.
      // 둘 다 없으면 이미지 없는 글(기본 이미지) — 원본 presigned URL을 따로 조회하지 않는다.
      imageKey={post.post_thumbnail}
      imageUrl={post.post_thumbnail_url}
      title={post.content}
      place={post.location}
      timeAgo={formatRelativeTime(post.created_at)}
      likeCount={post.like_count}
      liked={post.liked_by_me}
      isMine={isMine(post)}
      canEdit={isMine(post)}
      onEditPress={setEditingPost}
      onDeletePress={setDeletingPostId}
      imagePriority={index < HIGH_PRIORITY_COUNT ? 'high' : undefined}
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
  state: CurrentBoardFeedState;
  header: ReactElement;
  refreshControl: ReactElement<RefreshControlProps>;
}

// 다음 페이지 요청이 실패하면 끝에 다시 닿아도 onEndReached가 다시 오지 않아, 직접 다시 받게 한다.
const Footer = ({ state }: { state: CurrentBoardFeedState }) => {
  if (state.isFetchingNextPage) {
    return (
      <View className="w-full items-center py-lg">
        <ActivityIndicator color={palette.primary[600]} />
      </View>
    );
  }
  if (state.isFetchNextPageError) {
    return <ErrorRetry message="다음 게시글을 불러오지 못했어요." onRetry={state.fetchNextPage} />;
  }
  return null;
};

/**
 * 피드 화면 전체 목록. 카드마다 캐릭터·이미지 URL을 따로 요청하므로, 게시물이 많아도
 * 화면에 보이는 카드만 그리도록 FlatList로 그리고, 끝에 닿으면 다음 페이지를 이어 받는다.
 */
export function PostFlatList({ state, header, refreshControl }: FlatProps) {
  const { renderCard, dialogs } = usePostActions();
  const posts = state.isLoading || state.isError ? [] : state.posts;

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(post) => post.post_id}
        renderItem={({ item, index }) => renderCard(item, index)}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        ListHeaderComponentClassName="pb-2xl"
        ListEmptyComponent={<PostListStatus state={state} />}
        ListFooterComponent={<Footer state={state} />}
        onEndReached={state.fetchNextPage}
        onEndReachedThreshold={0.5}
        contentContainerClassName="px-xl pb-lg pt-lg"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        initialNumToRender={INITIAL_NUM_TO_RENDER}
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        windowSize={WINDOW_SIZE}
      />
      {dialogs}
    </>
  );
}
