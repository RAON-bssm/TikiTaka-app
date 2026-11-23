import { useRef, useState, type FC } from 'react';
import { Platform, Pressable, Share, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { trackEvent } from '@/api/analytics';
import DownloadIcon from '@/assets/icons/download.svg';
import ShareIcon from '@/assets/icons/share.svg';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { getPostShareUrl } from '@/constants/share';

const ICON_SIZE = 20;

interface Props {
  postId: string;
  /** 사진 저장. 화면이 토스트까지 처리한다. */
  onSaveImage: () => void;
  className?: string;
}

function SheetRow({
  Icon,
  label,
  onPress,
}: {
  Icon: FC<SvgProps>;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex flex-row items-center gap-md rounded-md px-sm py-lg active:bg-gray-50"
    >
      <Icon width={24} height={24} color={palette.gray[500]} />
      <Typography variant="body1" className="text-gray-700">
        {label}
      </Typography>
    </Pressable>
  );
}

/**
 * 공유 아이콘을 누르면 "링크 공유 / 사진 저장" 시트를 띄운다.
 * 링크는 OS 공유창으로 보낸다(카톡·인스타 DM·문자 등은 사용자가 고른다). `url` 옵션은 iOS 전용이라
 * 두 플랫폼에서 같게 받도록 링크를 `message`에 넣는다.
 */
export default function PostShareButton({ postId, onSaveImage, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const shareLink = () => {
    Share.share({ message: getPostShareUrl(postId) })
      .then((result) => {
        if (result.action === Share.sharedAction) trackEvent('post_share');
      })
      .catch(() => {});
  };

  // iOS는 닫히는 중인 모달 위에 공유창을 띄우지 못해, 시트가 다 닫힌 뒤(onDismiss) 실행한다.
  // Android Modal은 onDismiss가 오지 않고 이런 제약도 없어 바로 실행한다.
  const runAfterClose = (action: () => void) => {
    setIsOpen(false);
    if (Platform.OS === 'ios') pendingActionRef.current = action;
    else action();
  };

  const handleDismiss = () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  };

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="게시글 공유하기"
        hitSlop={8}
        className={`active:opacity-70 ${className ?? ''}`}
      >
        <ShareIcon width={ICON_SIZE} height={ICON_SIZE} color={palette.gray[400]} />
      </Pressable>

      <BottomSheet visible={isOpen} onClose={() => setIsOpen(false)} onDismiss={handleDismiss}>
        <View className="gap-lg">
          <View>
            <SheetRow
              Icon={ShareIcon}
              label="링크 공유하기"
              onPress={() => runAfterClose(shareLink)}
            />
            <SheetRow
              Icon={DownloadIcon}
              label="사진 저장하기"
              onPress={() => runAfterClose(onSaveImage)}
            />
          </View>
          <Button content="닫기" variant="light" onclick={() => setIsOpen(false)} />
        </View>
      </BottomSheet>
    </>
  );
}
