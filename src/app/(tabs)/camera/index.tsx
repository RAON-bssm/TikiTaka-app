import CameraBackButton from '@/components/camera/CameraBackButton';
import CameraNotFound from '@/components/camera/CameraNotFound';
import CameraPermissionRequest from '@/components/camera/CameraPermissionRequest';
import FlipButton from '@/components/camera/FlipButton';
import MissionTitle from '@/components/camera/MissionTitle';
import ShutterButton from '@/components/camera/ShutterButton';
import ZoomControl from '@/components/camera/ZoomControl';
import useCameraZoom from '@/hooks/camera/useCameraZoom';
import { router, useIsFocused } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  type DeviceFilter,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';

const LENS_FILTER: DeviceFilter = {
  physicalDevices: ['ultra-wide-angle', 'wide-angle', 'telephoto'],
};

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { hasPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(facing, LENS_FILTER);

  const photoOutput = usePhotoOutput({ qualityPrioritization: 'quality' });

  const { zoom, selectedZoom, levels, handleSelectZoom, pinch } = useCameraZoom(device);

  const handleFlip = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleCapture = async () => {
    const photo = await photoOutput.capturePhotoToFile({}, {});
    if (photo) {
      router.push({
        pathname: '/camera/upload',
        params: { uri: `file://${photo.filePath}` },
      });
    }
  };

  if (!hasPermission) {
    return <CameraPermissionRequest onRequestPermission={requestPermission} />;
  }

  if (device == null) {
    return <CameraNotFound />;
  }

  return (
    <View className="flex-1 bg-black">
      <GestureDetector gesture={pinch}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused}
          outputs={[photoOutput]}
          zoom={zoom}
        />
      </GestureDetector>

      <MissionTitle title="예쁜 돌멩이 찾기" />
      <CameraBackButton />

      {/* 하단 컨트롤: safe area(홈 인디케이터)는 inset으로, 그 위 여백은 디자인 토큰(2xl)으로 분리 */}
      <View className="absolute left-0 right-0 bottom-0" style={{ paddingBottom: insets.bottom }}>
        <View className="items-center gap-lg pb-2xl">
          <ZoomControl levels={levels} selected={selectedZoom} onSelect={handleSelectZoom} />

          <View className="w-full flex-row items-center justify-center">
            <ShutterButton onPress={handleCapture} />
            <View className="absolute right-3xl">
              <FlipButton onPress={handleFlip} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
