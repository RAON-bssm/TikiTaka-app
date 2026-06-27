import FlipButton from '@/components/camera/FlipButton';
import MissionTitle from '@/components/camera/MissionTitle';
import ShutterButton from '@/components/camera/ShutterButton';
import ZoomControl, { ZOOM_LEVELS, type ZoomLevel } from '@/components/camera/ZoomControl';
import Typography from '@/components/ui/Typography';
import { useIsFocused } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
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

// 줌 버튼이 활성으로 보일 허용 오차 (핀치로 근처에 오면 해당 버튼 하이라이트)
const ZOOM_MATCH_TOLERANCE = 0.08;

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { hasPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  // 멀티렌즈 가상 기기. zoom 값이 임계점을 넘으면 vision-camera가 물리 렌즈를 자동 전환합니다.
  const device = useCameraDevice(facing, LENS_FILTER);

  // 촬영용 output. <Camera outputs>로 넘겨야 capturePhoto가 동작합니다.
  const photoOutput = usePhotoOutput({ qualityPrioritization: 'quality' });

  // v5에서 zoom은 사용자 배율과 거의 일치합니다. 1 = 1x(광각), 1 미만 = 초광각.
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, 10); // 과도한 디지털 줌 방지
  const hasUltraWide = minZoom < 1; // 초광각 렌즈가 있으면 minZoom이 1보다 작습니다.

  // zoom은 Reanimated 공유 값: 버튼/핀치 둘 다 이 값을 갱신하고 Camera에 직접 전달합니다.
  const zoom = useSharedValue(1);
  const zoomStart = useSharedValue(1);
  const [selectedZoom, setSelectedZoom] = useState('1');

  // 초광각 렌즈가 있는 기기에서만 .5 버튼을 노출합니다.
  const levels = useMemo(
    () => ZOOM_LEVELS.filter((level) => level.factor >= 1 || hasUltraWide),
    [hasUltraWide],
  );

  // 버튼별 실제 줌 목표값: 0.5x는 기기의 최소 줌(초광각 끝), 그 외는 배율 그대로.
  const targetForLevel = (level: ZoomLevel) =>
    level.factor < 1 ? minZoom : Math.max(minZoom, Math.min(level.factor, maxZoom));

  // 현재 줌 값에 해당하는 버튼 라벨로 하이라이트를 동기화합니다. (없으면 선택 해제)
  // JS 스레드에서 실행되므로 일반 함수/배열을 자유롭게 사용할 수 있습니다.
  const syncSelected = (value: number) => {
    const match = levels.find(
      (level) => Math.abs(value - targetForLevel(level)) < ZOOM_MATCH_TOLERANCE,
    );
    setSelectedZoom(match?.label ?? '');
  };

  // 핀치/버튼으로 zoom 공유 값이 바뀌면 선택된 버튼 하이라이트를 동기화합니다.
  useAnimatedReaction(
    () => zoom.value,
    (current) => runOnJS(syncSelected)(current),
    [minZoom, maxZoom, levels],
  );

  const handleSelectZoom = (level: ZoomLevel) => {
    // eslint-disable-next-line react-hooks/immutability -- Reanimated 공유 값 변경
    zoom.value = targetForLevel(level);
  };

  // 핀치 제스처: 시작 시점 줌에 손가락 벌린 비율(scale)을 곱해 부드럽게 줌
  const pinch = Gesture.Pinch()
    .onBegin(() => {
      zoomStart.value = zoom.value;
    })
    .onUpdate((event) => {
      const next = zoomStart.value * event.scale;
      // eslint-disable-next-line react-hooks/immutability -- Reanimated 공유 값 변경
      zoom.value = Math.max(minZoom, Math.min(next, maxZoom));
    });

  const handleFlip = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
    // eslint-disable-next-line react-hooks/immutability -- Reanimated 공유 값 변경
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
