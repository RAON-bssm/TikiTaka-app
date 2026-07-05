import { ZOOM_LEVELS, type ZoomLevel } from '@/components/camera/ZoomControl';
import { useEffect, useMemo, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import type { CameraDevice } from 'react-native-vision-camera';

// 줌 버튼이 활성으로 보일 허용 오차 (핀치로 근처에 오면 해당 버튼 하이라이트)
const ZOOM_MATCH_TOLERANCE = 0.08;

// 카메라 줌 로직을 담당하는 훅.
// - 기기마다 다른 zoom 스케일을 사용자 배율(0.5x/1x/2x…)로 보정
// - 초광각 유무에 따라 노출 줌 버튼 결정
// - 핀치 제스처와 버튼 선택을 하나의 Reanimated 공유 값으로 통합
export default function useCameraZoom(device: CameraDevice | undefined) {
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

  return { zoom, selectedZoom, levels, handleSelectZoom, pinch };
}
