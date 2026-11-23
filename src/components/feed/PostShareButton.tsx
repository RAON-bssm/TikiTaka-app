import { Pressable, Share } from 'react-native';

import { trackEvent } from '@/api/analytics';
import ShareIcon from '@/assets/icons/share.svg';
import { palette } from '@/constants/colors';
import { getPostShareUrl } from '@/constants/share';

const ICON_SIZE = 20;

interface Props {
  postId: string;
  className?: string;
}

/**
 * OS 공유창을 띄운다(카톡·인스타 DM·문자 등은 사용자가 고른다).
 * `url` 옵션은 iOS 전용이라, 두 플랫폼에서 같게 받도록 링크를 `message`에 넣는다.
 */
export default function PostShareButton({ postId, className }: Props) {
  const handlePress = () => {
    Share.share({ message: getPostShareUrl(postId) })
      .then((result) => {
        if (result.action === Share.sharedAction) trackEvent('post_share');
      })
      .catch(() => {});
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="게시글 공유하기"
      hitSlop={8}
      className={`active:opacity-70 ${className ?? ''}`}
    >
      <ShareIcon width={ICON_SIZE} height={ICON_SIZE} color={palette.gray[400]} />
    </Pressable>
  );
}
