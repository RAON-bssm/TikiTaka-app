import { useState } from 'react';
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

export default function LikeButton({
  postId,
  likeCount,
  liked = false,
  className,
  textClassName,
}: Props) {
  const { showToast } = useToast();
  const { mutate: toggleLike } = useTogglePostLike(postId);
  // 목록은 서버가 눌림 여부를 주지 않아 이번에 누른 상태를 따로 들고 있어야 한다.
  const [override, setOverride] = useState<boolean>();
  const isLiked = override ?? liked;

  const handlePress = () => {
    const next = !isLiked;
    setOverride(next);
    toggleLike(next, {
      onError: (error) => {
        setOverride(!next);
        showToast(
          getApiErrorMessage(
            error,
            next ? '좋아요를 누르지 못했어요' : '좋아요를 취소하지 못했어요',
          ),
        );
      },
    });
  };

  return (
    <Pressable onPress={handlePress} className={`gap-xs active:opacity-70 ${className ?? ''}`}>
      <FavoriteIcon
        width={20}
        height={20}
        color={isLiked ? palette.primary[600] : palette.gray[400]}
      />
      <Typography variant="body3" className={textClassName}>
        {likeCount}
      </Typography>
    </Pressable>
  );
}
