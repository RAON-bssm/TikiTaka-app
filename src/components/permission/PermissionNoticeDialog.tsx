import type { ComponentType } from 'react';
import { Modal, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import CameraIcon from '@/assets/icons/app-var/camera.svg';
import NotificationIcon from '@/assets/icons/notification.svg';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';

export type NoticePermission = 'camera' | 'notification';

const PERMISSION_ROWS: Record<
  NoticePermission,
  { Icon: ComponentType<SvgProps>; label: string; purpose: string }
> = {
  camera: { Icon: CameraIcon, label: '카메라 (선택)', purpose: '동네 인증 사진 촬영' },
  notification: { Icon: NotificationIcon, label: '알림 (선택)', purpose: '일급 지급 등 소식 알림' },
};

/**
 * 정보통신망법 제22조의2: 권한을 요청하기 전에 어떤 권한을 왜 쓰는지 먼저 알려야 한다(원스토어 심사 항목).
 * 설치 후 처음 한 번만 띄운다. 카메라 권한은 카메라 화면에 들어갈 때, 알림 권한은 확인을 누른 직후 요청한다.
 * 이미 안내를 본 기존 사용자에게는 새로 추가된 권한(`permissions`)만 보여 준다.
 */
interface PermissionNoticeDialogProps {
  visible: boolean;
  permissions: NoticePermission[];
  onConfirm: () => void;
  onDismiss?: () => void;
}

export default function PermissionNoticeDialog({
  visible,
  permissions,
  onConfirm,
  onDismiss,
}: PermissionNoticeDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onDismiss={onDismiss}
    >
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

          <View className="gap-sm">
            {permissions.map((permission) => {
              const { Icon, label, purpose } = PERMISSION_ROWS[permission];
              return (
                <View
                  key={permission}
                  className="flex-row items-center gap-md rounded-md bg-gray-50 p-lg"
                >
                  <View className="rounded-full bg-primary-100 p-sm">
                    <Icon width={24} height={24} color={palette.primary[600]} />
                  </View>
                  <View className="flex-1 gap-xs">
                    <Typography variant="h4" className="text-gray-800">
                      {label}
                    </Typography>
                    <Typography variant="body3" className="text-gray-500">
                      {purpose}
                    </Typography>
                  </View>
                </View>
              );
            })}
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
