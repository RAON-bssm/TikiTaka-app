import { Modal, View } from 'react-native';

import CameraIcon from '@/assets/icons/app-var/camera.svg';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';

/**
 * 정보통신망법 제22조의2: 권한을 요청하기 전에 어떤 권한을 왜 쓰는지 먼저 알려야 한다(원스토어 심사 항목).
 * 설치 후 처음 한 번만 띄우고, 실제 권한 요청은 카메라 화면에 들어갈 때 한다.
 */
interface PermissionNoticeDialogProps {
  visible: boolean;
  onConfirm: () => void;
}

export default function PermissionNoticeDialog({
  visible,
  onConfirm,
}: PermissionNoticeDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className="w-[300px] gap-2xl rounded-xl bg-white px-xl pb-xl pt-2xl">
          <View className="items-center gap-sm">
            <Typography variant="h2" className="text-gray-800">
              앱 접근권한 안내
            </Typography>
            <Typography variant="body2" className="text-center text-gray-500">
              서비스 이용을 위해 아래 권한을 사용해요.
            </Typography>
          </View>

          <View className="flex-row items-center gap-md rounded-md bg-gray-50 p-lg">
            <View className="rounded-full bg-primary-100 p-sm">
              <CameraIcon width={24} height={24} color={palette.primary[600]} />
            </View>
            <View className="flex-1 gap-xs">
              <Typography variant="h4" className="text-gray-800">
                카메라 (선택)
              </Typography>
              <Typography variant="body3" className="text-gray-500">
                동네 인증 사진 촬영
              </Typography>
            </View>
          </View>

          <Typography variant="caption" className="text-center text-gray-400">
            선택 권한은 허용하지 않아도 앱을 이용할 수 있어요.{'\n'}권한은 기기 설정에서 언제든 바꿀
            수 있어요.
          </Typography>

          <Button content="확인" onclick={onConfirm} />
        </View>
      </View>
    </Modal>
  );
}
