import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import LoadingImage from '@/components/ui/feedback/LoadingImage';
import { invalidateImageUrls } from '@/hooks/post/invalidateImageUrls';
import { useViewUrl } from '@/hooks/storage/useViewUrl';

interface Props {
  postId: string;
  /** 이미지 캐시 키(S3 key, `post_image`). */
  imageKey: string;
  /** 응답에 같이 온 조회 URL. 없으면(발급 실패) `imageKey`로 직접 받는다. */
  imageUrl?: string;
}

export default function PostImage({ postId, imageKey, imageUrl }: Props) {
  const needsFallback = !imageUrl;
  const fallback = useViewUrl(needsFallback ? imageKey : undefined);
  const resolvedUri = imageUrl ?? fallback.uri;
  const isLoading = needsFallback && fallback.isLoading;

  // presigned URL 만료(10분)로 다운로드가 실패하면 새 URL을 받도록 상세를 다시 받는다. 한 번만.
  const queryClient = useQueryClient();
  const hasRetriedRef = useRef(false);
  const handleImageError = () => {
    if (hasRetriedRef.current) return;
    hasRetriedRef.current = true;
    invalidateImageUrls(queryClient, postId);
  };

  return (
    <LoadingImage
      uri={isLoading ? undefined : resolvedUri}
      cacheKey={imageKey}
      enforceEarlyResizing
      onError={handleImageError}
      className="h-[320px] w-full rounded-lg"
    />
  );
}
