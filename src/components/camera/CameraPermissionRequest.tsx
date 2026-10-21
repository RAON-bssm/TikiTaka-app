import Typography from '@/components/ui/Typography';
import { Linking, Pressable, View } from 'react-native';

interface Props {
  /** `'not-determined'`일 때만 true. false면 OS가 다시 권한 팝업을 띄우지 않아 설정으로 보내야 한다. */
  canRequestPermission: boolean;
  onRequestPermission: () => void;
}

export default function CameraPermissionRequest({
  canRequestPermission,
  onRequestPermission,
}: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-lg bg-black p-xl">
      <Typography variant="body1" className="text-center text-white">
        동네 사진을 촬영하려면 카메라 권한이 필요해요.
      </Typography>
      <Pressable
        onPress={canRequestPermission ? onRequestPermission : () => void Linking.openSettings()}
        className="rounded-full bg-primary-600 px-xl py-md"
      >
        <Typography variant="h4" className="text-white">
          {canRequestPermission ? '계속' : '설정에서 권한 변경하기'}
        </Typography>
      </Pressable>
    </View>
  );
}
