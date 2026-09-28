import CameraBackButton from '@/components/camera/CameraBackButton';
import Typography from '@/components/ui/Typography';
import { View } from 'react-native';

export default function CameraNotFound() {
  return (
    <View className="flex-1 items-center justify-center gap-lg bg-black p-xl">
      <CameraBackButton />
      <Typography variant="body1" className="text-center text-white">
        사용 가능한 카메라를 찾을 수 없어요.
      </Typography>
    </View>
  );
}
