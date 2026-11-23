import { Pressable } from 'react-native';

import { trackEvent } from '@/api/analytics';
import { PhotoPermissionDeniedError } from '@/api/photoSave';
import DownloadIcon from '@/assets/icons/download.svg';
import { useToast } from '@/components/ui/Toast';
import { palette } from '@/constants/colors';
import { useSavePostImage } from '@/hooks/post/useSavePostImage';

const ICON_SIZE = 20;

interface Props {
  imageKey: string;
  imageUrl?: string;
  className?: string;
}

export default function PostSaveImageButton({ imageKey, imageUrl, className }: Props) {
  const { mutate: save, isPending } = useSavePostImage();
  const { showToast } = useToast();

  const handlePress = () => {
    save(
      { imageKey, imageUrl },
      {
        onSuccess: () => {
          trackEvent('post_image_save');
          showToast('사진을 앨범에 저장했어요');
        },
        onError: (error) => {
          if (error instanceof PhotoPermissionDeniedError) {
            showToast('사진 저장 권한을 기기 설정에서 허용해 주세요');
            return;
          }
          showToast('사진을 저장하지 못했어요. 다시 시도해 주세요.');
        },
      },
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isPending}
      accessibilityRole="button"
      accessibilityLabel="사진 저장하기"
      hitSlop={8}
      className={`active:opacity-70 ${isPending ? 'opacity-40' : ''} ${className ?? ''}`}
    >
      <DownloadIcon width={ICON_SIZE} height={ICON_SIZE} color={palette.gray[400]} />
    </Pressable>
  );
}
