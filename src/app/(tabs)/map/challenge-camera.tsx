import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { Linking, Pressable, View } from 'react-native';

import { useTerritoryMockSettings } from '@/api/mock/territoryMockStore';
import CameraBackButton from '@/components/camera/CameraBackButton';
import CaptureView from '@/components/camera/CaptureView';
import MissionTitle from '@/components/camera/MissionTitle';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { getPendingMission } from '@/constants/territory/mission';
import { type HomeGuLocationStatus, useHomeGuLocation } from '@/hooks/territory/useHomeGuLocation';
import { useMyTeam } from '@/hooks/territory/useMyTeam';
import { useTerritory } from '@/hooks/territory/useTerritory';

// 개발용 샘플 사진은 릴리즈 번들에 넣지 않도록 __DEV__ 분기 안에서만 불러온다.
const loadSamplePhoto: (() => Promise<string>) | undefined = __DEV__
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- 정적 import는 __DEV__와 무관하게 번들된다
    require('@/api/mock/samplePhoto').loadSamplePhoto
  : undefined;

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
 * 찍은 사진은 편집 화면(`challenge-edit`)을 거치고, `purpose`에 따라 그다음 확인 화면만 달라진다.
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
  const isFocused = useIsFocused();
  const { showToast } = useToast();

  const { data: territory } = useTerritory(dongCode);
  const mock = useTerritoryMockSettings();
  const pendingMission = territory && getPendingMission(territory);
  const missionTitle =
    purpose === 'setup'
      ? [params.adjective, params.noun].filter(Boolean).join(' ')
      : purpose === 'retake'
        ? (pendingMission ?? territory?.mission ?? territory?.dong_name ?? '')
        : (territory?.mission ?? territory?.dong_name ?? '');
  const myTeam = useMyTeam();
  const { team } = myTeam;
  const homeGu = team?.location_name ?? '본진';
  const location = useHomeGuLocation(team, isFocused);
  // 본진을 못 받으면 위치 판정이 끝나지 않아 '확인 중'에 멈추므로, 실패로 보여 주고 다시 받게 한다.
  const teamFailed = !team && !myTeam.isLoading && location.status === 'checking';
  const message = teamFailed
    ? '본진 정보를 불러오지 못했어요'
    : locationMessage(location.status, homeGu);
  const locationAction = teamFailed
    ? '다시 시도'
    : location.status === 'denied'
      ? '허용하기'
      : undefined;

  /** 셔터를 누른 순간의 위치. 서버는 이 값을 검증하지 않고 기록만 한다. */
  const shotPosition = useRef<{ latitude: number; longitude: number }>(undefined);
  const samplingRef = useRef(false);

  const handleLocationAction = () => {
    if (teamFailed) {
      myTeam.refetch();
      return;
    }
    if (location.status !== 'denied') return;
    if (location.canAskAgain) void location.requestPermission();
    else void Linking.openSettings();
  };

  const goToEdit = (uri: string, latitude: number, longitude: number) => {
    router.push({
      pathname: '/map/challenge-edit',
      params: {
        dongCode: String(dongCode),
        purpose,
        uri,
        lat: String(latitude),
        lng: String(longitude),
        ...(params.adjective && { adjective: params.adjective }),
        ...(params.noun && { noun: params.noun }),
        ...(params.criteria && { criteria: params.criteria }),
      },
    });
  };

  const holdPosition = () => {
    if (location.status !== 'inside' || !location.position) {
      showToast(message ?? '위치를 확인하고 있어요');
      return false;
    }
    shotPosition.current = location.position;
    return true;
  };

  const handleCaptured = (uri: string) => {
    if (!shotPosition.current) return;
    const { latitude, longitude } = shotPosition.current;
    goToEdit(uri, latitude, longitude);
  };

  const takeSamplePhoto = async (load: () => Promise<string>) => {
    if (samplingRef.current || !holdPosition()) return;
    samplingRef.current = true;
    try {
      handleCaptured(await load());
    } catch {
      showToast('사진을 찍지 못했어요. 다시 시도해주세요.');
    } finally {
      samplingRef.current = false;
    }
  };

  const notice = (className: string) =>
    message && (
      <Pressable onPress={handleLocationAction} disabled={!locationAction} className={className}>
        <Typography variant="body3" className="text-center text-white">
          {locationAction ? `${message} · ${locationAction}` : message}
        </Typography>
      </Pressable>
    );

  return (
    <CaptureView
      title={missionTitle}
      onShutter={holdPosition}
      onCaptured={handleCaptured}
      dimShutter={location.status !== 'inside'}
      notice={notice('rounded-full bg-black/60 px-lg py-sm')}
      unavailable={
        // 시뮬레이터에는 카메라가 없어 개발용 목 모드에서는 샘플 사진으로 다음 화면을 볼 수 있게 한다.
        loadSamplePhoto && mock.enabled ? (
          <View className="flex-1 justify-center gap-lg bg-black px-xl">
            <MissionTitle title={missionTitle} />
            <CameraBackButton />
            <Typography variant="body2" className="text-center text-white">
              카메라를 쓸 수 없어요 (개발용 목 모드)
            </Typography>
            {notice('self-center rounded-full bg-white/20 px-lg py-sm')}
            <Button
              content="샘플 사진으로 찍기"
              onclick={() => void takeSamplePhoto(loadSamplePhoto)}
            />
          </View>
        ) : undefined
      }
    />
  );
}
