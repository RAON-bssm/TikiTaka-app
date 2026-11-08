import { Image, View } from 'react-native';

import useImageRatio from '@/hooks/useImageRatio';

/** 방금 찍은 사진을 원본 비율 그대로 보여준다. 비율을 알기 전에는 같은 자리에 빈 칸을 둔다. */
export default function CapturedPhoto({ uri }: { uri: string | undefined }) {
  const ratio = useImageRatio(uri);

  if (!uri || !ratio) {
    return <View className="h-[232px] w-full overflow-hidden rounded-md bg-gray-100" />;
  }
  return (
    <Image
      source={{ uri }}
      resizeMode="cover"
      className="w-full overflow-hidden rounded-md bg-gray-100"
      style={{ aspectRatio: ratio }}
    />
  );
}
