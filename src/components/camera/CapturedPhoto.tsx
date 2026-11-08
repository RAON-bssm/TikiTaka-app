import { Image, View } from 'react-native';

import useImageRatio from '@/hooks/useImageRatio';

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
