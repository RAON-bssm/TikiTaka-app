import { useIsFocused } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Linking, View } from 'react-native';

import CameraBackButton, { leaveCamera } from '@/components/camera/CameraBackButton';
import {
  CAMERA_PERMISSION_DESCRIPTION,
  CAMERA_PERMISSION_TITLE,
} from '@/components/camera/CameraPermissionGate';
import ConfirmDialog from '@/components/ui/feedback/ConfirmDialog';

interface Props {
  /** `'not-determined'`일 때만 true. false면 OS가 다시 권한 팝업을 띄우지 않아 설정으로 보내야 한다. */
  canRequestPermission: boolean;
  onRequestPermission: () => Promise<boolean>;
}

/**
 * 진입 전에 `useRequireCamera`로 막지만, 카메라 화면에 있는 동안 설정에서 권한을 끄는 등 진입 검사를 거치지 않은 경우 여기로 온다.
 * 거절하거나 취소하면 카메라를 떠나, 권한 없이 화면에 갇히지 않게 한다.
 */
export default function CameraPermissionRequest({
  canRequestPermission,
  onRequestPermission,
}: Props) {
  // 탭 화면은 떠난 뒤에도 마운트돼 있어, 다른 화면에 있을 때 권한이 바뀌어도 팝업이 그 위에 뜨지 않게 한다.
  const isFocused = useIsFocused();
  // OS 팝업으로 물을 화면이면, 거절 직후 상태가 'denied'로 바뀌어도 설정 안내를 겹쳐 띄우지 않고 바로 떠난다.
  const [willAsk] = useState(canRequestPermission);
  const askedRef = useRef(false);

  // App Store 심사(5.1.1)상 OS 팝업 앞에 취소할 수 있는 자체 안내를 두면 리젝되므로, 물을 수 있으면 바로 OS 팝업을 띄운다.
  const askOnce = useEffectEvent(() => {
    if (!canRequestPermission || askedRef.current) return;
    askedRef.current = true;
    onRequestPermission()
      .then((granted) => {
        if (!granted) leaveCamera();
      })
      .catch(leaveCamera);
  });
  useEffect(() => {
    if (isFocused) askOnce();
  }, [isFocused]);

  return (
    <View className="flex-1 bg-black">
      {/* 카메라 탭은 탭바를 숨기고 탭 루트라 스와이프 뒤로가기도 없다. 이 버튼이 없으면 iOS에서 갇힌다. */}
      <CameraBackButton />
      <ConfirmDialog
        visible={isFocused && !canRequestPermission && !willAsk}
        title={CAMERA_PERMISSION_TITLE}
        description={`${CAMERA_PERMISSION_DESCRIPTION}\n설정에서 바꿀 수 있어요.`}
        confirmLabel="설정으로 이동"
        onConfirm={() => void Linking.openSettings()}
        onCancel={leaveCamera}
      />
    </View>
  );
}
