import CameraBackButton from '@/components/camera/CameraBackButton';
import FlipButton from '@/components/camera/FlipButton';
import MissionTitle from '@/components/camera/MissionTitle';
import ShutterButton from '@/components/camera/ShutterButton';
import ZoomControl, { ZOOM_LEVELS, type ZoomLevel } from '@/components/camera/ZoomControl';
import Typography from '@/components/ui/Typography';
import { router, useIsFocused } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
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

// DEV ONLY: 카메라가 없는 환경(시뮬레이터)에서 쓸 목 사진 URI.
// 원격 URL은 시뮬레이터에서 로드가 불안정해, 로컬 번들 이미지를 URI로 변환해 사용합니다.
// 실제 배포 시 handleMockCapture / device==null 목 버튼과 mock-photo.jpg를 함께 삭제하세요.
const MOCK_PHOTO_URI = Image.resolveAssetSource(require('@/assets/images/mock-photo.jpg')).uri;

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { hasPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  // 멀티렌즈 가상 기기. zoom 값이 임계점을 넘으면 vision-camera가 물리 렌즈를 자동 전환합니다.
  const device = useCameraDevice(facing, LENS_FILTER);

  // 촬영용 output. <Camera outputs>로 넘겨야 capturePhoto가 동작합니다.
  const photoOutput = usePhotoOutput({ qualityPrioritization: 'quality' });

  // v5의 zoom 값은 기기마다 스케일이 다릅니다. (어떤 기기는 zoom=1이 초광각)
  // 사용자 기준 "1x"(광각 렌즈가 시작되는 지점)는 zoomLensSwitchFactors[0]로 알 수 있습니다.
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, 10); // 과도한 디지털 줌 방지
  const switchFactors = device?.zoomLensSwitchFactors ?? [];
  // 초광각 렌즈를 실제로 가진 기기인지 확인합니다.
  const hasUltraWide = device?.physicalDevices?.some((d) => d.type === 'ultra-wide-angle') ?? false;
  // 사용자 1x에 해당하는 vision-camera zoom 값.
  // 초광각이 있으면 광각 렌즈가 시작되는 지점(switchFactors[0])이 1x입니다.
  const baseZoom = hasUltraWide && switchFactors.length > 0 ? switchFactors[0] : minZoom;

  // zoom은 Reanimated 공유 값: 버튼/핀치 둘 다 이 값을 갱신하고 Camera에 직접 전달합니다.
  const zoom = useSharedValue(1);
  const zoomStart = useSharedValue(1);
  const [selectedZoom, setSelectedZoom] = useState('1');

  // 카메라가 로드되거나 전후면 전환되면 기본 줌을 사용자 1x(baseZoom)로 맞춥니다.
  useEffect(() => {
    zoom.value = baseZoom;
  }, [baseZoom, zoom]);

  // 초광각 렌즈가 있는 기기에서만 .5 버튼을 노출합니다.
  const levels = useMemo(
    () => ZOOM_LEVELS.filter((level) => level.factor >= 1 || hasUltraWide),
    [hasUltraWide],
  );

  // 버튼별 실제 줌 목표값: 사용자 배율 × baseZoom 을 기기 한계로 보정합니다.
  // 예) baseZoom=2 인 기기에서 0.5x → zoom 1(초광각), 1x → zoom 2, 2x → zoom 4.
  const targetForLevel = (level: ZoomLevel) =>
    Math.max(minZoom, Math.min(level.factor * baseZoom, maxZoom));

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
    // 줌은 baseZoom 변화를 감지하는 useEffect가 자동으로 1x로 리셋합니다.
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

  // ──────────────────────────────────────────────────────────────
  // DEV ONLY: iOS 시뮬레이터 등 사용 가능한 카메라가 없는 환경에서
  // 업로드 화면 흐름을 확인하기 위한 목(mock) 데이터입니다.
  // 네트워크 없이도 뜨도록 로컬 번들 이미지를 URI로 변환해 사용합니다.
  // 실제 배포 시 이 블록과 아래 device==null 화면의 목 버튼을 함께 삭제하세요.
  // (추후 카메라 없음 처리는 토스트 알럿 후 뒤로가기로 대체 예정)
  const handleMockCapture = () => {
    router.push({ pathname: '/camera/upload', params: { uri: MOCK_PHOTO_URI } });
  };
  // ──────────────────────────────────────────────────────────────

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

  // 사용 가능한 카메라 기기를 찾지 못한 경우 (예: iOS 시뮬레이터)
  if (device == null) {
    return (
      <View className="flex-1 items-center justify-center gap-lg bg-black p-xl">
        {/* 카메라를 찾을 수 없는 화면에서도 뒤로가기가 가능해야 합니다. */}
        <CameraBackButton />
        <Typography variant="body1" className="text-center text-white">
          사용 가능한 카메라를 찾을 수 없어요.
        </Typography>

        {/* DEV ONLY: 시뮬레이터에서 목 사진으로 업로드 화면을 확인합니다. 배포 시 삭제하세요. */}
        {__DEV__ ? (
          <Pressable
            onPress={handleMockCapture}
            className="rounded-full bg-primary-600 px-xl py-md"
          >
            <Typography variant="h4" className="text-white">
              목 사진으로 촬영 (개발용)
            </Typography>
          </Pressable>
        ) : null}
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
