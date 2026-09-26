import { Modal, Pressable, View } from 'react-native';

import { getApiErrorMessage } from '@/api/error';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useDeletePost } from '@/hooks/post/useDeletePost';

interface Props {
  postId?: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function PostDeleteDialog({ postId, onClose, onDeleted }: Props) {
  const { showToast } = useToast();
  const { mutate: deletePost, isPending } = useDeletePost();

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleDelete = () => {
    if (!postId || isPending) return;

    deletePost(postId, {
      onSuccess: () => {
        showToast('게시글을 삭제했어요');
        onClose();
        onDeleted?.();
      },
      onError: (error) => showToast(getApiErrorMessage(error, '게시글을 삭제하지 못했어요')),
    });
  };

  return (
    <Modal
      visible={!!postId}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 items-center justify-center bg-black/20" onPress={handleClose}>
        <Pressable
          onPress={() => {}}
          className="w-[280px] gap-2xl rounded-lg border border-gray-100 bg-white p-lg"
        >
          <View className="gap-sm">
            <Typography variant="h3" className="text-gray-800">
              게시글을 삭제할까요?
            </Typography>
            <Typography variant="body3" className="text-gray-500">
              이 글로 얻은 점수도 함께 빠져요.
            </Typography>
          </View>
          <View className="flex-row gap-sm">
            <Button
              content="취소"
              variant="light"
              size="sm"
              className="flex-1"
              onclick={handleClose}
            />
            <Button
              content={isPending ? '삭제 중...' : '삭제하기'}
              size="sm"
              className={`flex-1 ${isPending ? 'opacity-50' : ''}`}
              onclick={handleDelete}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
