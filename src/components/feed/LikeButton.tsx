import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { getApiErrorMessage } from '@/api/error';
import FavoriteIcon from '@/assets/icons/favorite.svg';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { useTogglePostLike } from '@/hooks/post/useTogglePostLike';

const ICON_SIZE = 20;
const POP_SCALE = 1.35;
const SHRINK_SCALE = 0.85;

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
  const scale = useSharedValue(1);

  const handlePress = () => {
    const next = !liked;
    if (next) {
      scale.set(
        withSequence(
          withTiming(POP_SCALE, { duration: 120, easing: Easing.out(Easing.quad) }),
          withSpring(1, { damping: 8, stiffness: 260 }),
        ),
      );
    } else {
      scale.set(withSequence(withTiming(SHRINK_SCALE, { duration: 90 }), withSpring(1)));
    }
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

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPress={handlePress} className={`gap-xs active:opacity-70 ${className ?? ''}`}>
      <Animated.View style={iconStyle}>
        <FavoriteIcon
          width={ICON_SIZE}
          height={ICON_SIZE}
          color={liked ? palette.primary[600] : palette.gray[400]}
        />
      </Animated.View>
      <Typography variant="body3" className={textClassName}>
        {likeCount}
      </Typography>
    </Pressable>
  );
}
