import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { CommonActions } from 'expo-router/build/react-navigation/routers';
import { useEffect, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { trackEvent } from '@/api/analytics';
import { PhotoPermissionDeniedError } from '@/api/photoSave';
import BlockUserDialog from '@/components/block/BlockUserDialog';
import AiScoreCard from '@/components/feed/AiScoreCard';
import AiScoreCheckCard from '@/components/feed/AiScoreCheckCard';
import PostAuthor from '@/components/feed/PostAuthor';
import PostDeleteDialog from '@/components/feed/PostDeleteDialog';
import PostDetailSkeleton from '@/components/feed/PostDetailSkeleton';
import PostEditDialog from '@/components/feed/PostEditDialog';
import PostImage from '@/components/feed/PostImage';
import PostReviewNotice from '@/components/feed/PostReviewNotice';
import PostTitleRow from '@/components/feed/PostTitleRow';
import ReportDialog, { type ReportTarget } from '@/components/report/ReportDialog';
import BackButton from '@/components/ui/BackButton';
import ConfirmDialog from '@/components/ui/feedback/ConfirmDialog';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Header from '@/components/ui/Header';
import { useToast } from '@/components/ui/Toast';
import { palette } from '@/constants/colors';
import { usePostDetail } from '@/hooks/post/usePostDetail';
import { useSavePostImage } from '@/hooks/post/useSavePostImage';
import { useMyInfo } from '@/hooks/user/useMyInfo';

export default function PostDetailScreen() {
  const { post_id } = useLocalSearchParams<{ post_id: string }>();
  const navigation = useNavigation();
  const { data: post, isLoading, isError, refetch } = usePostDetail(post_id);
  const { data: myInfo } = useMyInfo();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget>();
  const [blockTarget, setBlockTarget] = useState<{ userId: string; userName: string }>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const { mutate: saveImage, isPending: isSavingImage } = useSavePostImage();
  const { showToast } = useToast();

  const handleSaveImage = (imageKey: string, imageUrl?: string) => {
    if (isSavingImage) return;
    saveImage(
      { imageKey, imageUrl },
      {
        onSuccess: () => {
          trackEvent('post_image_save');
          showToast('사진을 앨범에 저장했어요');
        },
        onError: (error) => {
          showToast(
            error instanceof PhotoPermissionDeniedError
              ? '사진 저장 권한을 기기 설정에서 허용해 주세요'
              : '사진을 저장하지 못했어요. 다시 시도해 주세요.',
          );
        },
      },
    );
  };

  // 게시글 상세는 탭 위에 덮는 루트 스택 화면이다. 공유 링크로 바로 열거나 로그인 직후 replace로 오면
  // 밑에 탭이 없어 뒤로 갈 곳이 없으므로, 피드 탭을 밑에 깔아 뒤로 가기가 피드 목록으로 가게 한다.
  useEffect(() => {
    const state = navigation.getState();
    if (!state || state.index !== 0) return;
    navigation.dispatch(
      CommonActions.reset({
        ...state,
        index: 1,
        routes: [{ name: '(tabs)', params: { screen: 'feed' } }, state.routes[0]],
      }),
    );
  }, [navigation]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // 점수·코멘트는 확인을 눌러야 공개한다. 업로드 후 이동이 이 화면을 재사용하면 이전 게시물의
  // 공개 상태가 남으므로, boolean이 아니라 공개한 게시물 id로 기억한다.
  const [revealedPostId, setRevealedPostId] = useState<string>();
  const scoreRevealed = revealedPostId === post_id;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
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
        <BackButton title="게시물" />

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
                          // 심사 중인 글은 수정이 409이고, 심사를 못 통과한 글은 고쳐도 다시 심사되지 않는다.
                          ...(post.status === 'DONE'
                            ? [{ label: '수정하기', onPress: () => setIsEditOpen(true) }]
                            : []),
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
                          {
                            label: '작성자 차단하기',
                            destructive: true,
                            onPress: () =>
                              setBlockTarget({ userId: post.user_id, userName: post.user_name }),
                          },
                        ]
                }
              />
              <PostImage
                postId={post_id}
                imageKey={post.post_image}
                imageUrl={post.post_image_url}
                onLongPress={() => setIsSaveConfirmOpen(true)}
              />
            </View>

            <PostTitleRow
              postId={post_id}
              title={post.content}
              onSaveImage={() => handleSaveImage(post.post_image, post.post_image_url)}
              likeCount={post.status === 'DONE' ? post.like_count : undefined}
              liked={post.liked_by_me}
            />

            {post.status !== 'DONE' ? (
              <PostReviewNotice status={post.status} />
            ) : scoreRevealed ? (
              <AiScoreCard score={post.score ?? 0} comment={post.ai_review ?? ''} />
            ) : (
              <AiScoreCheckCard onCheck={() => setRevealedPostId(post_id)} />
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
      <ConfirmDialog
        visible={isSaveConfirmOpen}
        title="사진을 저장할까요?"
        description="게시글 사진을 앨범에 저장해요."
        confirmLabel="저장"
        onConfirm={() => {
          setIsSaveConfirmOpen(false);
          if (post) handleSaveImage(post.post_image, post.post_image_url);
        }}
        onCancel={() => setIsSaveConfirmOpen(false)}
      />
      <ReportDialog target={reportTarget} onClose={() => setReportTarget(undefined)} />
      <BlockUserDialog
        target={blockTarget}
        onClose={() => setBlockTarget(undefined)}
        onBlocked={() => router.back()}
      />
    </SafeAreaView>
  );
}
