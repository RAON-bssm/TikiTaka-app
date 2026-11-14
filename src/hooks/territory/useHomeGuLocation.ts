import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useTerritoryMockSettings } from '@/api/mock/territoryMockStore';
import { isInTeamArea } from '@/constants/territory/region';
import type { Location as TeamLocation } from '@/types/location';

const MOCK_POSITION = { latitude: 35.1798, longitude: 129.075 };

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
  const mock = useTerritoryMockSettings();
  // 개발용 목 모드에서 위치 판정을 건너뛰면 위치 API를 아예 부르지 않는다.
  // 권한 문구가 없는 예전 빌드에서도 권한 조회만으로 앱이 멈추지 않게 하기 위해서다.
  const skip = __DEV__ && mock.enabled && mock.skipLocation;
  const watching = active && !skip;
  const [permission, requestPermission, getPermission] = Location.useForegroundPermissions({
    get: !skip,
  });
  const [position, setPosition] = useState<Position>();
  const [failed, setFailed] = useState(false);
  const granted = permission?.granted === true;
  const undetermined = permission?.status === Location.PermissionStatus.UNDETERMINED;
  const asked = useRef(false);
  const [inForeground, setInForeground] = useState(AppState.currentState !== 'background');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) =>
      setInForeground(state !== 'background'),
    );
    return () => subscription.remove();
  }, []);

  // 아직 한 번도 묻지 않았으면 거부로 보여 주지 말고 카메라를 열 때 바로 묻는다.
  useEffect(() => {
    if (!watching || !undetermined || asked.current) return;
    asked.current = true;
    void requestPermission();
  }, [watching, undetermined, requestPermission]);

  // 훅은 마운트할 때만 권한을 조회한다. 설정 앱에서 권한을 켜고 돌아와도 반영되도록 앱 복귀 때 다시 읽는다.
  useEffect(() => {
    if (!watching) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void getPermission();
    });
    return () => subscription.remove();
  }, [watching, getPermission]);

  useEffect(() => {
    if (!watching || !granted || !inForeground) return;
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
      setPosition(undefined);
      setFailed(false);
    };
  }, [watching, granted, inForeground]);

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

  if (skip) {
    return {
      status: 'inside' as HomeGuLocationStatus,
      position: position ?? MOCK_POSITION,
      canAskAgain: true,
      requestPermission,
    };
  }

  return {
    status,
    position,
    /** 다시 묻지 않음을 고른 경우 false라 설정 앱으로 보내야 한다. */
    canAskAgain: permission?.canAskAgain ?? true,
    requestPermission,
  };
}
