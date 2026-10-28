import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import Skeleton from '@/components/ui/feedback/Skeleton';

interface Props {
  uri?: string;
  className?: string;
}

const FADE_MS = 250;

/** URL 조회부터 다운로드가 끝날 때까지 스켈레톤을 깔고, 다 받으면 이미지를 서서히 드러낸다. */
export default function LoadingImage({ uri, className = '' }: Props) {
  const reduceMotion = useReducedMotion();
  // URL이 바뀌면 새 이미지가 받아질 때까지 다시 스켈레톤을 보여야 해서 URL로 기억한다.
  const [loadedUri, setLoadedUri] = useState<string | null>(null);
  const isLoaded = uri !== undefined && loadedUri === uri;

  return (
    <View className={`overflow-hidden ${className}`}>
      {!isLoaded && <Skeleton className="h-full w-full" />}
      {uri ? (
        <Image
          source={{ uri }}
          // 기본 동작은 새 URL을 받는 동안 이전 이미지를 남겨 두는데, 이미지가 스켈레톤 위에 있어 스켈레톤을 가린다.
          recyclingKey={uri}
          contentFit="cover"
          transition={reduceMotion ? 0 : FADE_MS}
          onLoad={() => setLoadedUri(uri)}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  );
}
