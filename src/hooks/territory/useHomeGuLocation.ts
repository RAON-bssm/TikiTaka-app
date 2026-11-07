import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { isInGu } from '@/constants/territory/region';

export type HomeGuLocationStatus = 'checking' | 'inside' | 'outside' | 'denied' | 'unavailable';

interface Position {
  latitude: number;
  longitude: number;
}

/**
 * 땅따먹기 사진은 본진 구 안에서만 찍는다. 서버는 위치를 검증하지 않아 앱이 촬영 전에 막는다.
 * 걸어서 구 경계를 넘는 경우를 위해 켜져 있는 동안 위치를 계속 본다.
 */
export function useHomeGuLocation(gu: string | undefined, active: boolean) {
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [position, setPosition] = useState<Position>();
  const [failed, setFailed] = useState(false);
  const granted = permission?.granted === true;

  useEffect(() => {
    if (!active || !granted) return;
    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 20 },
      (location) => {
        setFailed(false);
        setPosition({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      },
      () => setFailed(true),
    )
      .then((created) => {
        if (cancelled) created.remove();
        else subscription = created;
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [active, granted]);

  const status: HomeGuLocationStatus = !permission
    ? 'checking'
    : !granted
      ? 'denied'
      : failed && !position
        ? 'unavailable'
        : !position || !gu
          ? 'checking'
          : isInGu(gu, position)
            ? 'inside'
            : 'outside';

  return {
    status,
    position,
    /** 다시 묻지 않음을 고른 경우 false라 설정 앱으로 보내야 한다. */
    canAskAgain: permission?.canAskAgain ?? true,
    requestPermission,
  };
}
