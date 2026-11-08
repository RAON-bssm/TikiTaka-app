import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { type LayoutChangeEvent, Linking, Pressable, StyleSheet, View } from 'react-native';
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
import Typography from '@/components/ui/Typography';
import { getPendingMission } from '@/constants/territory/mission';
import { cropToPreview } from '@/hooks/camera/cropToPreview';
import useCameraZoom from '@/hooks/camera/useCameraZoom';
import { type HomeGuLocationStatus, useHomeGuLocation } from '@/hooks/territory/useHomeGuLocation';
import { useMyTeam } from '@/hooks/territory/useMyTeam';
import { useTerritory } from '@/hooks/territory/useTerritory';

const LENS_FILTER: DeviceFilter = {
  physicalDevices: ['ultra-wide-angle', 'wide-angle', 'telephoto'],
};

function locationMessage(status: HomeGuLocationStatus, gu: string): string | undefined {
  switch (status) {
    case 'checking':
      return '위치를 확인하고 있어요';
    case 'outside':
      return `${gu} 안에서만 찍을 수 있어요`;
    case 'denied':
      return `${gu} 안에서 찍는지 확인하려면 위치 권한이 필요해요`;
    case 'unavailable':
      return '위치를 확인하지 못했어요. 위치 서비스를 켜 주세요';
    default:
      return undefined;
  }
}

/**
 * 땅따먹기 사진은 모두 본진 구 안에서 찍어야 해서, 도전·땅 세팅·방어 사진 재촬영이 이 카메라를 같이 쓴다.
 * `purpose`에 따라 다음 화면만 달라진다.
 */
type Params = {
  dongCode: string;
  purpose?: 'challenge' | 'setup' | 'retake';
  /** 땅 세팅은 미션과 사진을 한 요청으로 보내 입력값을 다음 화면까지 넘긴다. */
  adjective?: string;
  noun?: string;
  criteria?: string;
};

export default function ChallengeCameraScreen() {
  const params = useLocalSearchParams<Params>();
  const dongCode = Number(params.dongCode);
  const purpose = params.purpose ?? 'challenge';
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { showToast } = useToast();

  const { data: territory } = useTerritory(dongCode);
  const pendingMission = territory && getPendingMission(territory);
  const missionTitle =
    purpose === 'setup'
      ? [params.adjective, params.noun].filter(Boolean).join(' ')
      : purpose === 'retake'
        ? (pendingMission ?? territory?.mission ?? territory?.dong_name ?? '')
        : (territory?.mission ?? territory?.dong_name ?? '');
  const { team } = useMyTeam();
  const homeGu = team?.location_name ?? '본진';
  const location = useHomeGuLocation(team, isFocused);
  const message = locationMessage(location.status, homeGu);

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

  const handleLocationAction = () => {
    if (location.status !== 'denied') return;
    if (location.canAskAgain) void location.requestPermission();
    else void Linking.openSettings();
  };

  const handleCapture = async () => {
    if (location.status !== 'inside' || !location.position) {
      showToast(message ?? '위치를 확인하고 있어요');
      return;
    }
    if (capturingRef.current) return;
    capturingRef.current = true;
    // 셔터를 누른 순간의 위치를 기록한다. 서버는 이 값을 검증하지 않고 기록만 한다.
    const { latitude, longitude } = location.position;
    try {
      const photo = await photoOutput.capturePhotoToFile({}, {});
      if (!photo) return;
      const uri = `file://${photo.filePath}`;
      const croppedUri = previewAspect
        ? await cropToPreview(uri, previewAspect).catch(() => uri)
        : uri;
      if (purpose === 'challenge') {
        router.push({
          pathname: '/map/challenge-confirm',
          params: {
            dongCode: String(dongCode),
            uri: croppedUri,
            lat: String(latitude),
            lng: String(longitude),
          },
        });
      } else {
        router.push({
          pathname: '/map/territory/defense-confirm',
          params: {
            dongCode: String(dongCode),
            purpose,
            uri: croppedUri,
            ...(params.adjective && { adjective: params.adjective }),
            ...(params.noun && { noun: params.noun }),
            ...(params.criteria && { criteria: params.criteria }),
          },
        });
      }
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
          onStarted={() => void cameraRef.current?.controller?.setZoom(zoom.get())}
          device={device}
          isActive={isFocused}
          outputs={[photoOutput]}
          zoom={zoom}
        />
      </GestureDetector>

      <MissionTitle title={missionTitle} />
      <CameraBackButton />

      <View className="absolute left-0 right-0 bottom-0" style={{ paddingBottom: insets.bottom }}>
        <View className="items-center gap-lg pb-2xl">
          {message && (
            <Pressable
              onPress={handleLocationAction}
              disabled={location.status !== 'denied'}
              className="rounded-full bg-black/60 px-lg py-sm"
            >
              <Typography variant="body3" className="text-center text-white">
                {location.status === 'denied' ? `${message} · 허용하기` : message}
              </Typography>
            </Pressable>
          )}
          <ZoomControl levels={levels} selected={selectedZoom} onSelect={handleSelectZoom} />

          <View
            className={`w-full flex-row items-center justify-center ${
              location.status === 'inside' ? '' : 'opacity-50'
            }`}
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
