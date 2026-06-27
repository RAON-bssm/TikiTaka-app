import FlipButton from '@/components/camera/FlipButton';
import MissionTitle from '@/components/camera/MissionTitle';
import ShutterButton from '@/components/camera/ShutterButton';
import ZoomControl, { ZOOM_LEVELS, type ZoomLevel } from '@/components/camera/ZoomControl';
import Typography from '@/components/ui/Typography';
import { useIsFocused } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { hasPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  // 여러 물리 렌즈(초광각/광각/망원)를 묶은 가상 기기를 반환합니다.
  // zoom 값이 임계점을 넘으면 vision-camera가 알아서 물리 렌즈를 전환합니다.
  const device = useCameraDevice(facing);

  // 촬영용 output. <Camera outputs>로 넘겨야 capturePhoto가 동작합니다.
  const photoOutput = usePhotoOutput({ qualityPrioritization: 'quality' });

  // v5에서 zoom은 배율 그대로입니다. 1 = 기본 광각, 0.5 미만 = 초광각.
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, 10); // 과도한 디지털 줌 방지
  const hasUltraWide = minZoom < 1;

  // zoom은 Reanimated 공유 값: 버튼/핀치 둘 다 이 값을 갱신하고 Camera에 직접 전달합니다.
  const zoom = useSharedValue(1);
  const zoomStart = useSharedValue(1);
  const [selectedZoom, setSelectedZoom] = useState('1');

  // 초광각 렌즈가 있는 기기에서만 .5 버튼을 노출합니다.
  const levels = useMemo(
    () => ZOOM_LEVELS.filter((level) => level.factor >= 1 || hasUltraWide),
    [hasUltraWide],
  );

  const clamp = (value: number) => Math.max(minZoom, Math.min(value, maxZoom));

  const handleSelectZoom = (level: ZoomLevel) => {
    setSelectedZoom(level.label);
    zoom.value = withTiming(clamp(level.factor), { duration: 200 });
  };

  // 핀치 제스처: 시작 시점 줌에 손가락 벌린 비율(scale)을 곱해 부드럽게 줌
  const pinch = Gesture.Pinch()
    .onBegin(() => {
      zoomStart.value = zoom.value;
    })
    .onUpdate((event) => {
      const next = zoomStart.value * event.scale;
      zoom.value = Math.max(minZoom, Math.min(next, maxZoom));
    });

  const handleFlip = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
    setSelectedZoom('1');
    zoom.value = 1;
  };

  const handleCapture = async () => {
    const photo = await photoOutput.capturePhotoToFile({}, {});
    if (photo) {
      // TODO: 촬영 결과 미리보기/업로드 화면으로 연결
      console.log('captured:', `file://${photo.filePath}`);
    }
  };

  // 권한이 없으면 요청 안내
  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center gap-lg bg-black p-xl">
        <Typography variant="body1" className="text-center text-white">
          동네 사진을 촬영하려면 카메라 권한이 필요해요.
        </Typography>
        <Pressable onPress={requestPermission} className="rounded-full bg-primary-600 px-xl py-md">
          <Typography variant="h4" className="text-white">
            권한 허용하기
          </Typography>
        </Pressable>
      </View>
    );
  }

  // 사용 가능한 카메라 기기를 찾지 못한 경우
  if (device == null) {
    return (
      <View className="flex-1 items-center justify-center bg-black p-xl">
        <Typography variant="body1" className="text-center text-white">
          사용 가능한 카메라를 찾을 수 없어요.
        </Typography>
      </View>
    );
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
