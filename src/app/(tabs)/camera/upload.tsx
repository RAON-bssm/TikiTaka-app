import Topic from '@/components/camera/Topic';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/input/Dropdown';
import TextInput from '@/components/ui/input/TextInput';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useBoards } from '@/hooks/post/useBoards';
import { useUploadPost } from '@/hooks/post/useUploadPost';
import useImageRatio from '@/hooks/useImageRatio';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Upload() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  // 가로는 부모 폭으로 고정, 세로는 원본 비율(가로/세로)에 맞춰 유동
  const photoRatio = useImageRatio(uri);

  const [content, setContent] = useState('');
  const { showToast } = useToast();
  const { mutate: uploadPost, isPending } = useUploadPost();

  // TODO: 실제 미션 선택 UI와 연결. 지금은 게시판 목록의 첫 항목(현재 게시판)에 올린다.
  const { data: boards } = useBoards();
  const currentBoard = boards?.[0];
  const boardId = currentBoard?.board_id;

  const handleUpload = () => {
    if (isPending) return;
    if (!uri) {
      showToast('사진을 불러올 수 없어요.');
      return;
    }
    if (boardId == null) {
      showToast('게시판 정보를 불러오는 중이에요.');
      return;
    }

    uploadPost(
      { fileUri: uri, boardId, content },
      {
        onSuccess: (postId) => {
          showToast('게시물이 등록됐어요');
          // 방금 올린 글의 상세 페이지로 이동한다. id를 못 받은 경우엔 이전 화면으로 되돌아간다.
          if (postId) {
            router.replace({ pathname: '/feed/[post_id]', params: { post_id: postId } });
          } else {
            router.back();
          }
        },
        onError: () => showToast('업로드에 실패했어요. 다시 시도해주세요.'),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="flex flex-col gap-2xl px-xl py-2xl"
        showsVerticalScrollIndicator={false}
        bottomOffset={16}
        keyboardShouldPersistTaps="handled"
      >
        <Topic title={currentBoard?.mission ?? ''} />

        {/* 촬영한 사진 미리보기: 폭은 부모를 채우고, 높이는 사진 원본 비율에 맞춰 반응형 */}
        {uri && photoRatio ? (
          <Image
            source={{ uri }}
            resizeMode="cover"
            className="w-full overflow-hidden rounded-md bg-gray-100"
            style={{ aspectRatio: photoRatio }}
          />
        ) : uri ? (
          <View className="h-[232px] w-full overflow-hidden rounded-md bg-gray-100" />
        ) : (
          <View className="h-[232px] w-full items-center justify-center overflow-hidden rounded-md bg-gray-100">
            <Typography variant="body1" className="text-gray-500">
              사진을 불러올 수 없어요.
            </Typography>
          </View>
        )}

        <View className="flex flex-col gap-md">
          <TextInput
            label="미션 한마디"
            placeholder="게시물을 표현하는 한마디를 작성해주세요"
            value={content}
            onChangeText={setContent}
          />
          <Dropdown
            label="공개 범위"
            placeholder="공개 범위를 선택해주세요"
            options={['전체공개', '비공개']}
          />
        </View>

        <Button content={isPending ? '업로드 중...' : '게시물 업로드'} onclick={handleUpload} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
