import Topic from '@/components/camera/Topic';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/input/Dropdown';
import TextInput from '@/components/ui/input/TextInput';
import Typography from '@/components/ui/Typography';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Upload() {
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const [photoRatio, setPhotoRatio] = useState<number>();

  const handleUpload = () => {
    // TODO: 서버 업로드 API 연동 (TanStack Query useMutation)
    console.log('upload photo:', uri);
  };

  return (
    <View className="flex-1 bg-gray-100" style={{ paddingTop: insets.top }}>
      <View className="flex flex-col gap-2xl px-xl py-2xl">
        <Topic title="예쁜 돌멩이 찾기" />

        {/* 촬영한 사진 미리보기: 폭은 부모를 채우고, 높이는 사진 원본 비율에 맞춰 반응형 */}
        {uri ? (
          <Image
            source={{ uri }}
            resizeMode="cover"
            onLoad={(e) => {
              const { width, height } = e.nativeEvent.source;
              if (width && height) setPhotoRatio(width / height);
            }}
            className="w-full overflow-hidden rounded-md bg-gray-200"
            style={{ aspectRatio: photoRatio }}
          />
        ) : (
          <View className="h-[232px] w-full items-center justify-center overflow-hidden rounded-md bg-gray-200">
            <Typography variant="body1" className="text-gray-600">
              사진을 불러올 수 없어요.
            </Typography>
          </View>
        )}

        <View className="flex flex-col gap-md">
          <TextInput label="미션 한마디" placeholder="게시물을 표현하는 한마디를 작성해주세요" />
          <Dropdown
            label="공개 범위"
            placeholder="공개 범위를 선택해주세요"
            options={['전체공개', '비공개']}
          />
        </View>

        <Button content="게시물 업로드" onclick={handleUpload} />
      </View>
    </View>
  );
}
