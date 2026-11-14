import { createContext, type ReactNode, useContext, useState } from 'react';
import { Linking } from 'react-native';
import { VisionCamera } from 'react-native-vision-camera';

import ConfirmDialog from '@/components/ui/feedback/ConfirmDialog';

export const CAMERA_PERMISSION_TITLE = '카메라 권한이 필요해요';
export const CAMERA_PERMISSION_DESCRIPTION = '동네 사진을 촬영하려면 카메라 권한을 허용해 주세요.';

type RequireCamera = (onGranted: () => void) => void;

const CameraPermissionContext = createContext<RequireCamera | null>(null);

/** 카메라 화면에 들어가기 전에 권한을 확인해, 권한 없이 카메라 화면에 갇히지 않게 한다. */
export function CameraPermissionProvider({ children }: { children: ReactNode }) {
  const [deniedVisible, setDeniedVisible] = useState(false);

  const requireCamera: RequireCamera = (onGranted) => {
    const status = VisionCamera.cameraPermissionStatus;
    if (status === 'authorized') {
      onGranted();
      return;
    }
    // 'not-determined'만 OS 팝업을 다시 띄울 수 있다. 여기서 거절하면 사용자가 방금 고른 것이라 안내를 겹쳐 띄우지 않는다.
    if (status === 'not-determined') {
      VisionCamera.requestCameraPermission()
        .then((granted) => {
          if (granted) onGranted();
        })
        .catch(() => setDeniedVisible(true));
      return;
    }
    setDeniedVisible(true);
  };

  return (
    <CameraPermissionContext.Provider value={requireCamera}>
      {children}
      <ConfirmDialog
        visible={deniedVisible}
        title={CAMERA_PERMISSION_TITLE}
        description={`${CAMERA_PERMISSION_DESCRIPTION}\n설정에서 바꿀 수 있어요.`}
        confirmLabel="설정으로 이동"
        onConfirm={() => {
          setDeniedVisible(false);
          void Linking.openSettings();
        }}
        onCancel={() => setDeniedVisible(false)}
      />
    </CameraPermissionContext.Provider>
  );
}

/** 카메라 권한이 있을 때만 `onGranted`를 실행한다. 카메라 화면으로 가는 모든 이동을 이것으로 감싼다. */
export function useRequireCamera() {
  const context = useContext(CameraPermissionContext);
  if (!context) throw new Error('useRequireCamera는 CameraPermissionProvider 안에서 써야 해요.');
  return context;
}
