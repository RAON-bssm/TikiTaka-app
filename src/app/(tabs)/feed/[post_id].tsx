import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import AiScoreCard from '@/components/feed/AiScoreCard';
import AiScoreCheckCard from '@/components/feed/AiScoreCheckCard';
import PostAuthor from '@/components/feed/PostAuthor';
import PostDeleteDialog from '@/components/feed/PostDeleteDialog';
import PostDetailSkeleton from '@/components/feed/PostDetailSkeleton';
import PostEditDialog from '@/components/feed/PostEditDialog';
import PostImage from '@/components/feed/PostImage';
import PostTitleRow from '@/components/feed/PostTitleRow';
import ReportDialog, { type ReportTarget } from '@/components/report/ReportDialog';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Header from '@/components/ui/Header';
import { palette } from '@/constants/colors';
import { usePostDetail } from '@/hooks/post/usePostDetail';
import { useMyInfo } from '@/hooks/user/useMyInfo';

export default function PostDetailScreen() {
  const { post_id } = useLocalSearchParams<{ post_id: string }>();
  const { data: post, isLoading, isError, refetch, isRefetching } = usePostDetail(post_id);
  const { data: myInfo } = useMyInfo();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget>();

  // 점수·코멘트는 확인을 눌러야 공개한다.
  const [scoreRevealed, setScoreRevealed] = useState(false);

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
          <>
            <View className="flex flex-col gap-lg">
              <PostAuthor
                name={post.user_name}
                userId={post.user_id}
                place={post.location}
                createdAt={post.created_at}
                menuItems={
                  !myInfo
                    ? undefined
                    : post.user_id === myInfo.user_id
                      ? [
                          { label: '수정하기', onPress: () => setIsEditOpen(true) },
                          {
                            label: '삭제하기',
                            destructive: true,
                            onPress: () => setIsDeleteOpen(true),
                          },
                        ]
                      : [
                          {
                            label: '게시글 신고하기',
                            destructive: true,
                            onPress: () => setReportTarget({ type: 'post', postId: post_id }),
                          },
                          {
                            label: '작성자 신고하기',
                            destructive: true,
                            onPress: () =>
                              setReportTarget({
                                type: 'user',
                                userId: post.user_id,
                                userName: post.user_name,
                              }),
                          },
                        ]
                }
              />
              <PostImage uri={post.post_image} />
            </View>

            <PostTitleRow
              postId={post_id}
              title={post.content}
              likeCount={post.like_count}
              liked={post.liked_by_me}
            />

            {scoreRevealed ? (
              <AiScoreCard score={post.score} comment={post.ai_review} />
            ) : (
              <AiScoreCheckCard onCheck={() => setScoreRevealed(true)} />
            )}
          </>
        )}
      </ScrollView>
      <PostEditDialog
        post={isEditOpen && post ? { postId: post_id, content: post.content } : undefined}
        onClose={() => setIsEditOpen(false)}
      />
      <PostDeleteDialog
        postId={isDeleteOpen ? post_id : undefined}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => router.back()}
      />
      <ReportDialog target={reportTarget} onClose={() => setReportTarget(undefined)} />
    </SafeAreaView>
  );
}
