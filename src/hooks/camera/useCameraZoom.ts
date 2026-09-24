import { ZOOM_LEVELS, type ZoomLevel } from '@/components/camera/ZoomControl';
import { useEffect, useMemo, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import type { CameraDevice } from 'react-native-vision-camera';

// 핀치로 이 오차 안에 들어오면 해당 줌 버튼을 하이라이트한다.
const ZOOM_MATCH_TOLERANCE = 0.08;

// 핀치와 줌 버튼이 하나의 Reanimated 공유 값(zoom)을 갱신하고, 이 값을 Camera에 직접 넘긴다.
export default function useCameraZoom(device: CameraDevice | undefined) {
  // vision-camera v5의 zoom 스케일은 기기마다 달라 어떤 기기는 zoom=1이 초광각이다.
  // 그래서 초광각이 있으면 광각 렌즈가 시작되는 zoomLensSwitchFactors[0]을 사용자 "1x"로 본다.
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, 10); // 과도한 디지털 줌 방지
  const switchFactors = device?.zoomLensSwitchFactors ?? [];
  const hasUltraWide = device?.physicalDevices?.some((d) => d.type === 'ultra-wide-angle') ?? false;
  const baseZoom = hasUltraWide && switchFactors.length > 0 ? switchFactors[0] : minZoom;

  const zoom = useSharedValue(1);
  const zoomStart = useSharedValue(1);
  const [selectedZoom, setSelectedZoom] = useState('1');

  // 카메라 로드·전후면 전환 시 사용자 1x로 되돌린다.
  useEffect(() => {
    zoom.value = baseZoom;
  }, [baseZoom, zoom]);

  // .5 버튼은 초광각 렌즈가 있는 기기에서만 노출한다.
  const levels = useMemo(
    () => ZOOM_LEVELS.filter((level) => level.factor >= 1 || hasUltraWide),
    [hasUltraWide],
  );

  // 예) baseZoom=2인 기기에서 0.5x → zoom 1(초광각), 1x → zoom 2, 2x → zoom 4.
  const targetForLevel = (level: ZoomLevel) =>
    Math.max(minZoom, Math.min(level.factor * baseZoom, maxZoom));

  // runOnJS로 JS 스레드에서 실행되므로 일반 함수/배열을 써도 된다.
  const syncSelected = (value: number) => {
    const match = levels.find(
      (level) => Math.abs(value - targetForLevel(level)) < ZOOM_MATCH_TOLERANCE,
    );
    setSelectedZoom(match?.label ?? '');
  };

  useAnimatedReaction(
    () => zoom.value,
    (current) => runOnJS(syncSelected)(current),
    [minZoom, maxZoom, levels],
  );

  const handleSelectZoom = (level: ZoomLevel) => {
    // eslint-disable-next-line react-hooks/immutability -- Reanimated 공유 값 변경
    zoom.value = targetForLevel(level);
  };

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
