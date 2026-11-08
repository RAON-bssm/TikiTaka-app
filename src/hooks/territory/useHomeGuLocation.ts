import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

import { isInTeamArea } from '@/constants/territory/region';
import type { Location as TeamLocation } from '@/types/location';

export type HomeGuLocationStatus = 'checking' | 'inside' | 'outside' | 'denied' | 'unavailable';

interface Position {
  latitude: number;
  longitude: number;
}

/**
 * 땅따먹기 사진은 본진 구 안에서만 찍는다. 서버는 위치를 검증하지 않아 앱이 촬영 전에 막는다.
 * 걸어서 구 경계를 넘는 경우를 위해 켜져 있는 동안 위치를 계속 본다.
 */
export function useHomeGuLocation(team: TeamLocation | undefined, active: boolean) {
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [position, setPosition] = useState<Position>();
  const [failed, setFailed] = useState(false);
  const granted = permission?.granted === true;
  const undetermined = permission?.status === Location.PermissionStatus.UNDETERMINED;
  const asked = useRef(false);

  // 아직 한 번도 묻지 않았으면 거부로 보여 주지 말고 카메라를 열 때 바로 묻는다.
  useEffect(() => {
    if (!active || !undetermined || asked.current) return;
    asked.current = true;
    void requestPermission();
  }, [active, undetermined, requestPermission]);

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

  const status: HomeGuLocationStatus =
    !permission || undetermined
      ? 'checking'
      : !granted
        ? 'denied'
        : failed && !position
          ? 'unavailable'
          : !position || !team
            ? 'checking'
            : isInTeamArea(team, position)
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
