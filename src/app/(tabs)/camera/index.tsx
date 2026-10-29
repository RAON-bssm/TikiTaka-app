import CameraBackButton from '@/components/camera/CameraBackButton';
import CameraNotFound from '@/components/camera/CameraNotFound';
import CameraPermissionRequest from '@/components/camera/CameraPermissionRequest';
import FlipButton from '@/components/camera/FlipButton';
import MissionTitle from '@/components/camera/MissionTitle';
import { useToast } from '@/components/ui/Toast';
import ShutterButton from '@/components/camera/ShutterButton';
import ZoomControl from '@/components/camera/ZoomControl';
import useCameraZoom from '@/hooks/camera/useCameraZoom';
import { useMyBoard } from '@/hooks/post/useMyBoard';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { router, useIsFocused } from 'expo-router';
import { useRef, useState } from 'react';
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

const LENS_FILTER: DeviceFilter = {
  physicalDevices: ['ultra-wide-angle', 'wide-angle', 'telephoto'],
};

async function cropToPreview(uri: string, previewAspect: number): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  const original = await context.renderAsync();
  const { width, height } = original;
  original.release();

  const cropWidth = Math.min(width, Math.round(height * previewAspect));
  const cropHeight = Math.min(height, Math.round(width / previewAspect));
  context.crop({
    originX: Math.round((width - cropWidth) / 2),
    originY: Math.round((height - cropHeight) / 2),
    width: cropWidth,
    height: cropHeight,
  });
  const cropped = await context.renderAsync();
  const result = await cropped.saveAsync({ compress: 1, format: SaveFormat.JPEG });

  cropped.release();
  context.release();

  return result.uri;
}

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { showToast } = useToast();

  const { data: myBoard } = useMyBoard();
  const mission = myBoard?.mission ?? '';

  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(facing, LENS_FILTER);

  const photoOutput = usePhotoOutput({ qualityPrioritization: 'quality' });

  const { zoom, selectedZoom, levels, handleSelectZoom, pinch } = useCameraZoom(device);

  const cameraRef = useRef<CameraRef>(null);
  const [previewAspect, setPreviewAspect] = useState<number>();
  const capturingRef = useRef(false);

  const handleStarted = () => {
    void cameraRef.current?.controller?.setZoom(zoom.get());
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width && height) setPreviewAspect(width / height);
  };

  const handleFlip = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleCapture = async () => {
    if (capturingRef.current) return;
    capturingRef.current = true;
    try {
      const photo = await photoOutput.capturePhotoToFile({}, {});
      if (!photo) return;
      const uri = `file://${photo.filePath}`;
      router.push({
        pathname: '/camera/edit',
        params: { uri: previewAspect ? await cropToPreview(uri, previewAspect) : uri },
      });
    } catch {
      showToast('사진을 찍지 못했어요. 다시 시도해주세요.');
    } finally {
      capturingRef.current = false;
    }
  };

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
          onStarted={handleStarted}
          device={device}
          isActive={isFocused}
          outputs={[photoOutput]}
          zoom={zoom}
        />
      </GestureDetector>

      <MissionTitle title={mission} />
      <CameraBackButton />

      {/* safe area는 inset으로, 그 위 여백은 토큰(pb-2xl)으로 분리한다 */}
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
