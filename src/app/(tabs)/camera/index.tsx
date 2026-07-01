import CameraBackButton from '@/components/camera/CameraBackButton';
import CameraNotFound from '@/components/camera/CameraNotFound';
import CameraPermissionRequest from '@/components/camera/CameraPermissionRequest';
import FlipButton from '@/components/camera/FlipButton';
import MissionTitle from '@/components/camera/MissionTitle';
import ShutterButton from '@/components/camera/ShutterButton';
import ZoomControl from '@/components/camera/ZoomControl';
import useCameraZoom from '@/hooks/useCameraZoom';
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

// 초광각/광각/망원을 모두 묶은 가상 멀티렌즈 기기를 요청합니다.
// 이 필터가 없으면 광각 단일 렌즈만 잡혀 초광각(0.5x)이 동작하지 않습니다.
const LENS_FILTER: DeviceFilter = {
  physicalDevices: ['ultra-wide-angle', 'wide-angle', 'telephoto'],
};

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { hasPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  // 멀티렌즈 가상 기기. zoom 값이 임계점을 넘으면 vision-camera가 물리 렌즈를 자동 전환합니다.
  const device = useCameraDevice(facing, LENS_FILTER);

  // 촬영용 output. <Camera outputs>로 넘겨야 capturePhoto가 동작합니다.
  const photoOutput = usePhotoOutput({ qualityPrioritization: 'quality' });

  // 줌 관련 로직(기기별 배율 보정 · 렌즈 전환 · 핀치/버튼 조작)은 훅으로 분리했습니다.
  const { zoom, selectedZoom, levels, handleSelectZoom, pinch } = useCameraZoom(device);

  const handleFlip = () => {
    // 줌은 baseZoom 변화를 감지하는 훅 내부 useEffect가 자동으로 1x로 리셋합니다.
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleCapture = async () => {
    const photo = await photoOutput.capturePhotoToFile({}, {});
    if (photo) {
      // 촬영한 사진 경로를 업로드 화면으로 넘깁니다. (filePath는 file:// URL로 변환)
      router.push({
        pathname: '/camera/upload',
        params: { uri: `file://${photo.filePath}` },
      });
    }
  };

  // 권한이 없으면 요청 안내
  if (!hasPermission) {
    return <CameraPermissionRequest onRequestPermission={requestPermission} />;
  }

  // 사용 가능한 카메라 기기를 찾지 못한 경우 (예: iOS 시뮬레이터)
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

      <View
        className="absolute left-0 right-0 bottom-0 items-center gap-lg"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <ZoomControl levels={levels} selected={selectedZoom} onSelect={handleSelectZoom} />

        <View className="w-full flex-row items-center justify-center">
          <ShutterButton onPress={handleCapture} />
          <View className="absolute right-3xl">
            <FlipButton onPress={handleFlip} />
          </View>
        </View>
      </View>
    </View>
  );
}
