import CameraBackButton from '@/components/camera/CameraBackButton';
import Typography from '@/components/ui/Typography';
import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

// DEV ONLY: 카메라가 없는 시뮬레이터에서 업로드 흐름을 확인하기 위한 목 사진.
// 배포 시 MOCK 코드·목 버튼·mock-photo.jpg를 함께 삭제한다.
const MOCK_PHOTO_URI = Image.resolveAssetSource(require('@/assets/images/mock-photo.jpg')).uri;

export default function CameraNotFound() {
  const handleMockCapture = () => {
    router.push({ pathname: '/camera/upload', params: { uri: MOCK_PHOTO_URI } });
  };

  return (
    <View className="flex-1 items-center justify-center gap-lg bg-black p-xl">
      <CameraBackButton />
      <Typography variant="body1" className="text-center text-white">
        사용 가능한 카메라를 찾을 수 없어요.
      </Typography>

      {/* DEV ONLY */}
      {__DEV__ ? (
        <Pressable onPress={handleMockCapture} className="rounded-full bg-primary-600 px-xl py-md">
          <Typography variant="h4" className="text-white">
            목 사진으로 촬영 (개발용)
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
}
