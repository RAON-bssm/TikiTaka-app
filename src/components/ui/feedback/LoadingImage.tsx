import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import Skeleton from '@/components/ui/feedback/Skeleton';

interface Props {
  uri?: string;
  /**
   * 디스크 캐시 키. presigned URL은 발급할 때마다 바뀌어 URL로 캐시하면 같은 사진을 매번 다시 받으므로,
   * 바뀌지 않는 S3 key를 넘긴다.
   */
  cacheKey?: string;
  className?: string;
  /** 화면 맨 위 1~2장처럼 먼저 보이는 이미지에 'high'를 준다. */
  priority?: 'low' | 'normal' | 'high';
  /**
   * 컨테이너 크기에 맞춰 즉시 리사이즈(iOS 전용)해서 디코딩 메모리를 줄인다. 썸네일 없는 옛 글은
   * 원본 해상도가 그대로 내려오므로, 작은 카드에 그릴 땐 이 옵션이 있어야 스크롤 렉이 안 생긴다.
   */
  enforceEarlyResizing?: boolean;
  /** 다운로드 실패(주로 presigned URL 만료) 시 호출한다. 새 URL을 받도록 다시 조회하는 건 호출부 몫. */
  onError?: () => void;
}

const FADE_MS = 250;

/** URL 조회부터 다운로드가 끝날 때까지 스켈레톤을 깔고, 다 받으면 이미지를 서서히 드러낸다. */
export default function LoadingImage({
  uri,
  cacheKey,
  className = '',
  priority,
  enforceEarlyResizing,
  onError,
}: Props) {
  const reduceMotion = useReducedMotion();
  const imageKey = cacheKey ?? uri;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoaded = uri !== undefined && loadedKey === imageKey;

  return (
    <View className={`overflow-hidden ${className}`}>
      {!isLoaded && <Skeleton className="h-full w-full" />}
      {uri ? (
        <Image
          source={{ uri, cacheKey }}
          // 기본 동작은 새 URL을 받는 동안 이전 이미지를 남겨 두는데, 이미지가 스켈레톤 위에 있어 스켈레톤을 가린다.
          recyclingKey={imageKey}
          contentFit="cover"
          transition={reduceMotion ? 0 : FADE_MS}
          priority={priority}
          enforceEarlyResizing={enforceEarlyResizing}
          onLoad={() => setLoadedKey(imageKey ?? null)}
          onError={onError}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  );
}
