import { ActivityIndicator, Image, View } from 'react-native';

import { palette } from '@/constants/colors';
import { useViewUrl } from '@/hooks/storage/useViewUrl';

interface Props {
  /** 서버가 내려준 이미지 key (또는 절대 URL). */
  uri: string;
}

export default function PostImage({ uri }: Props) {
  // key → 표시용 조회 URL 변환. 발급 전에는 로딩 플레이스홀더를 보여준다.
  const { uri: resolvedUri, isLoading } = useViewUrl(uri);

  if (!resolvedUri || isLoading) {
    return (
      <View
        style={{ width: '100%', height: 320 }}
        className="items-center justify-center rounded-lg bg-gray-100"
      >
        <ActivityIndicator color={palette.primary[600]} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: resolvedUri }}
      style={{ width: '100%', height: 320 }}
      className="rounded-lg bg-gray-100"
    />
  );
}
