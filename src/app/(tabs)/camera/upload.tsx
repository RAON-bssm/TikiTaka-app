import Topic from '@/components/camera/Topic';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/input/Dropdown';
import TextInput from '@/components/ui/input/TextInput';
import Typography from '@/components/ui/Typography';
import { useLocalSearchParams } from 'expo-router';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Upload() {
  const insets = useSafeAreaInsets();
  // 카메라 화면에서 넘긴 촬영 사진 경로 (file:// URI)
  const { uri } = useLocalSearchParams<{ uri?: string }>();

  const handleUpload = () => {
    // TODO: 서버 업로드 API 연동 (TanStack Query useMutation)
    console.log('upload photo:', uri);
  };

  return (
    <View className="flex-1 bg-gray-100" style={{ paddingTop: insets.top }}>
      <View className="flex flex-col gap-2xl px-xl py-2xl">
        <Topic title="예쁜 돌멩이 찾기" />

        {/* 촬영한 사진 미리보기 */}
        <View className="h-[232px] w-full overflow-hidden rounded-md bg-gray-200">
          {uri ? (
            <Image source={{ uri }} resizeMode="cover" className="h-full w-full" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Typography variant="body1" className="text-gray-600">
                사진을 불러올 수 없어요.
              </Typography>
            </View>
          )}
        </View>

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
