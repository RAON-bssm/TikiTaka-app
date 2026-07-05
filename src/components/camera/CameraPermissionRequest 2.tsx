import Typography from '@/components/ui/Typography';
import { Pressable, View } from 'react-native';

interface Props {
  onRequestPermission: () => void;
}

// 카메라 권한이 없을 때 노출하는 권한 요청 화면.
export default function CameraPermissionRequest({ onRequestPermission }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-lg bg-black p-xl">
      <Typography variant="body1" className="text-center text-white">
        동네 사진을 촬영하려면 카메라 권한이 필요해요.
      </Typography>
      <Pressable onPress={onRequestPermission} className="rounded-full bg-primary-600 px-xl py-md">
        <Typography variant="h4" className="text-white">
          권한 허용하기
        </Typography>
      </Pressable>
    </View>
  );
}
