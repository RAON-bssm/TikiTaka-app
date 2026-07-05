import CameraBackButton from '@/components/camera/CameraBackButton';
import Typography from '@/components/ui/Typography';
import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

// DEV ONLY: iOS 시뮬레이터 등 사용 가능한 카메라가 없는 환경에서
// 업로드 화면 흐름을 확인하기 위한 목(mock) 데이터입니다.
// 네트워크 없이도 뜨도록 로컬 번들 이미지를 URI로 변환해 사용합니다.
// 실제 배포 시 아래 MOCK 관련 코드와 목 버튼, mock-photo.jpg를 함께 삭제하세요.
// (추후 카메라 없음 처리는 토스트 알럿 후 뒤로가기로 대체 예정)
const MOCK_PHOTO_URI = Image.resolveAssetSource(require('@/assets/images/mock-photo.jpg')).uri;

// 사용 가능한 카메라 기기를 찾지 못했을 때 노출하는 화면.
export default function CameraNotFound() {
  // DEV ONLY: 목 사진을 업로드 화면으로 넘깁니다.
  const handleMockCapture = () => {
    router.push({ pathname: '/camera/upload', params: { uri: MOCK_PHOTO_URI } });
  };

  return (
    <View className="flex-1 items-center justify-center gap-lg bg-black p-xl">
      {/* 카메라를 찾을 수 없는 화면에서도 뒤로가기가 가능해야 합니다. */}
      <CameraBackButton />
      <Typography variant="body1" className="text-center text-white">
        사용 가능한 카메라를 찾을 수 없어요.
      </Typography>

      {/* DEV ONLY: 시뮬레이터에서 목 사진으로 업로드 화면을 확인합니다. 배포 시 삭제하세요. */}
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
