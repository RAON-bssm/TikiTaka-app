import { Pressable } from 'react-native';

import { getApiErrorMessage } from '@/api/error';
import FavoriteIcon from '@/assets/icons/favorite.svg';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { useTogglePostLike } from '@/hooks/post/useTogglePostLike';

interface Props {
  postId: string;
  likeCount: number;
  liked?: boolean;
  className?: string;
  textClassName?: string;
}

/** 눌림 상태·개수는 훅이 쿼리 캐시에 먼저 반영하므로 prop만 그린다. */
export default function LikeButton({
  postId,
  likeCount,
  liked = false,
  className,
  textClassName,
}: Props) {
  const { showToast } = useToast();
  const { mutate: toggleLike } = useTogglePostLike(postId);

  const handlePress = () => {
    const next = !liked;
    toggleLike(next, {
      onError: (error) =>
        showToast(
          getApiErrorMessage(
            error,
            next ? '좋아요를 누르지 못했어요' : '좋아요를 취소하지 못했어요',
          ),
        ),
    });
  };

  return (
    <Pressable onPress={handlePress} className={`gap-xs active:opacity-70 ${className ?? ''}`}>
      <FavoriteIcon
        width={20}
        height={20}
        color={liked ? palette.primary[600] : palette.gray[400]}
      />
      <Typography variant="body3" className={textClassName}>
        {likeCount}
      </Typography>
    </Pressable>
  );
}
