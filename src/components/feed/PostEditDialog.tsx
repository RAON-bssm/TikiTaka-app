import { useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { getApiErrorMessage } from '@/api/error';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { useUpdatePost } from '@/hooks/post/useUpdatePost';

export interface EditingPost {
  postId: string;
  content: string;
}

interface Props {
  post?: EditingPost;
  onClose: () => void;
}

export default function PostEditDialog({ post, onClose }: Props) {
  return (
    <Modal
      visible={!!post}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* 열 때마다 입력값을 원문으로 초기화하려고 key로 폼을 새로 마운트한다. */}
      {post && <EditForm key={post.postId} post={post} onClose={onClose} />}
    </Modal>
  );
}

const EditForm = ({ post, onClose }: { post: EditingPost; onClose: () => void }) => {
  const { showToast } = useToast();
  const { mutate: updatePost, isPending } = useUpdatePost();
  const [content, setContent] = useState(post.content);
  // 토스트는 모달 아래에 깔려 보이지 않으므로 실패 사유는 창 안에 띄운다.
  const [errorMessage, setErrorMessage] = useState<string>();

  const nextContent = content.trim();
  const canSubmit = !isPending && nextContent !== '' && nextContent !== post.content;

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    setErrorMessage(undefined);
    updatePost(
      { postId: post.postId, req: { content: nextContent } },
      {
        onSuccess: () => {
          onClose();
          showToast('게시글을 수정했어요');
        },
        onError: (error) =>
          setErrorMessage(getApiErrorMessage(error, '게시글을 수정하지 못했어요')),
      },
    );
  };

  // 서드파티 컴포넌트라 NativeWind className이 적용되지 않아 style을 쓴다.
  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <Pressable className="flex-1 items-center justify-center bg-black/40" onPress={handleClose}>
        <Pressable
          onPress={() => {}}
          className="w-[300px] gap-2xl rounded-xl bg-white px-xl pb-xl pt-2xl"
        >
          <View className="items-center gap-sm">
            <Typography variant="h2" className="text-gray-800">
              게시글 수정
            </Typography>
            <Typography variant="body2" className="text-center text-gray-500">
              사진과 점수는 그대로 두고 글만 바뀌어요.
            </Typography>
          </View>
          <View className="gap-xs">
            <TextInput
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
              textAlignVertical="top"
              placeholder="내용을 입력해주세요"
              placeholderTextColor={palette.gray[400]}
              className="h-[120px] w-full rounded-sm border border-gray-200 bg-white p-md font-sans text-sm text-gray-800 focus:border-gray-300"
            />
            {errorMessage && (
              <Typography variant="caption" className="text-primary-600">
                {errorMessage}
              </Typography>
            )}
          </View>
          <View className="flex-row gap-sm">
            <Button content="취소" variant="light" className="flex-1" onclick={handleClose} />
            <Button
              content={isPending ? '수정 중...' : '수정하기'}
              className={`flex-1 ${canSubmit ? '' : 'opacity-50'}`}
              onclick={handleSubmit}
            />
          </View>
        </Pressable>
      </Pressable>
    </KeyboardAvoidingView>
  );
};
