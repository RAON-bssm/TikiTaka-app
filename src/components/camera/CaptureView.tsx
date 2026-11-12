import { useIsFocused } from 'expo-router';
import { type ReactNode, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  type CameraRef,
  type DeviceFilter,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';

import CameraBackButton from '@/components/camera/CameraBackButton';
import CameraNotFound from '@/components/camera/CameraNotFound';
import CameraPermissionRequest from '@/components/camera/CameraPermissionRequest';
import FlipButton from '@/components/camera/FlipButton';
import MissionTitle from '@/components/camera/MissionTitle';
import ShutterButton from '@/components/camera/ShutterButton';
import ZoomControl from '@/components/camera/ZoomControl';
import { useToast } from '@/components/ui/Toast';
import { cropToPreview } from '@/hooks/camera/cropToPreview';
import useCameraZoom from '@/hooks/camera/useCameraZoom';

const LENS_FILTER: DeviceFilter = {
  physicalDevices: ['ultra-wide-angle', 'wide-angle', 'telephoto'],
};

interface CaptureViewProps {
  title: string;
  /** 셔터를 누른 순간 호출된다. false면 찍지 않는다. 그 순간의 상태(위치 등)를 잡아 둘 때도 쓴다. */
  onShutter?: () => boolean;
  /** 프리뷰 비율로 자른 사진의 file:// uri */
  onCaptured: (uri: string) => void;
  dimShutter?: boolean;
  /** 줌 버튼 위에 띄우는 안내 */
  notice?: ReactNode;
  /** 권한이 없거나 기기에 카메라가 없을 때 기본 안내 대신 보여 준다. */
  unavailable?: ReactNode;
}

export default function CaptureView({
  title,
  onShutter,
  onCaptured,
  dimShutter = false,
  notice,
  unavailable,
}: CaptureViewProps) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { showToast } = useToast();

  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(facing, LENS_FILTER);
  const photoOutput = usePhotoOutput({ qualityPrioritization: 'quality' });
  const { zoom, selectedZoom, levels, handleSelectZoom, pinch } = useCameraZoom(device);

  const cameraRef = useRef<CameraRef>(null);
  const [previewAspect, setPreviewAspect] = useState<number>();
  const capturingRef = useRef(false);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width && height) setPreviewAspect(width / height);
  };

  const handleCapture = async () => {
    if (capturingRef.current) return;
    if (onShutter && !onShutter()) return;
    capturingRef.current = true;
    try {
      const photo = await photoOutput.capturePhotoToFile({}, {});
      if (!photo) return;
      const uri = `file://${photo.filePath}`;
      onCaptured(previewAspect ? await cropToPreview(uri, previewAspect).catch(() => uri) : uri);
    } catch {
      showToast('사진을 찍지 못했어요. 다시 시도해주세요.');
    } finally {
      capturingRef.current = false;
    }
  };

  if (unavailable && (!hasPermission || device == null)) {
    return unavailable;
  }

  if (!hasPermission) {
    return (
      <CameraPermissionRequest
        canRequestPermission={canRequestPermission}
        onRequestPermission={requestPermission}
      />
    );
  }

  if (device == null) {
    return <CameraNotFound />;
  }

  return (
    <View className="flex-1 bg-black">
      <GestureDetector gesture={pinch}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          onLayout={handleLayout}
          onStarted={() => void cameraRef.current?.controller?.setZoom(zoom.get())}
          device={device}
          isActive={isFocused}
          outputs={[photoOutput]}
          zoom={zoom}
        />
      </GestureDetector>

      <MissionTitle title={title} />
      <CameraBackButton />

      {/* safe area는 inset으로, 그 위 여백은 토큰(pb-2xl)으로 분리한다 */}
      <View className="absolute left-0 right-0 bottom-0" style={{ paddingBottom: insets.bottom }}>
        <View className="items-center gap-lg pb-2xl">
          {notice}
          <ZoomControl levels={levels} selected={selectedZoom} onSelect={handleSelectZoom} />

          <View
            className={`w-full flex-row items-center justify-center ${dimShutter ? 'opacity-50' : ''}`}
          >
            <ShutterButton onPress={handleCapture} />
            <View className="absolute right-3xl">
              <FlipButton
                onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
