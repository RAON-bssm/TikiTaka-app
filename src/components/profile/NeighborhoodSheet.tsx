import { getApiErrorMessage } from '@/api/error';
import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import FireIcon from '@/assets/icons/fire.svg';
import PlaceIcon from '@/assets/icons/place.svg';
import { palette } from '@/constants/colors';
import { formatLocationName } from '@/constants/location';
import { useCancelLocationChange } from '@/hooks/user/useLocationChange';
import { useMoveCurrentLocation } from '@/hooks/user/useMoveCurrentLocation';
import { useMyInfo } from '@/hooks/user/useMyInfo';
import type { UserLocation } from '@/types/location';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import ErrorRetry from '../ui/feedback/ErrorRetry';
import Skeleton from '../ui/feedback/Skeleton';
import Typography from '../ui/Typography';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const formatPlace = (location: UserLocation) =>
  formatLocationName(location.location_city_name, location.location_name);

const StatusBanner = ({ atHome }: { atHome: boolean }) => (
  <View
    className={`flex flex-row items-center gap-md rounded-md p-lg ${
      atHome ? 'bg-secondary-100' : 'bg-primary-100'
    }`}
  >
    {atHome ? (
      <PlaceIcon width={24} height={24} color={palette.secondary[500]} />
    ) : (
      <FireIcon width={24} height={24} color={palette.primary[600]} />
    )}
    <View className="flex flex-1 flex-col gap-xs">
      <Typography variant="h3" className={atHome ? 'text-secondary-500' : 'text-primary-600'}>
        {atHome ? '본진에서 활동 중이에요' : '지금 원정 중이에요'}
      </Typography>
      <Typography variant="body3" className="text-gray-500">
        {atHome
          ? '올린 게시물이 동네 점수에도 들어가요.'
          : '동네 점수는 본진에서 올린 게시물만 쌓여요.'}
      </Typography>
    </View>
  </View>
);

interface LocationCardProps {
  label: string;
  place: string;
  actionLabel: string;
  onPress: () => void;
  children?: ReactNode;
}

const LocationCard = ({ label, place, actionLabel, onPress, children }: LocationCardProps) => (
  <Pressable
    onPress={onPress}
    className="flex flex-col gap-md rounded-md border border-gray-100 bg-white p-lg active:bg-gray-50"
  >
    <View className="flex flex-row items-center justify-between">
      <View className="flex flex-col gap-xs">
        <Typography variant="body3" className="text-gray-400">
          {label}
        </Typography>
        <Typography variant="h3" className="text-gray-700">
          {place}
        </Typography>
      </View>
      <View className="flex flex-row items-center">
        <Typography variant="body2" className="text-gray-500">
          {actionLabel}
        </Typography>
        <ChevronRightIcon width={20} height={20} color={palette.gray[400]} />
      </View>
    </View>
    {children}
  </Pressable>
);

export default function NeighborhoodSheet({ visible, onClose }: Props) {
  const router = useRouter();
  const { data: myInfo, isLoading, isError, refetch } = useMyInfo();
  const { mutate: cancelChange, isPending: isCancelling } = useCancelLocationChange();
  const { mutate: moveCurrent, isPending: isReturning } = useMoveCurrentLocation();
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleClose = () => {
    setErrorMessage(undefined);
    onClose();
  };

  const handleRetry = () => {
    setErrorMessage(undefined);
    refetch();
  };

  // 이 시트는 RN Modal이고 ToastProvider는 그 아래 트리라 토스트가 가린다. 시트 안에 적는다.
  const showError = (fallback: string) => (error: unknown) =>
    setErrorMessage(getApiErrorMessage(error, fallback));

  const handleCancel = () => {
    if (isCancelling) return;
    setErrorMessage(undefined);
    cancelChange(undefined, { onError: showError('예약을 취소하지 못했어요.') });
  };

  const handleReturnHome = () => {
    if (isReturning || !myInfo) return;
    setErrorMessage(undefined);
    moveCurrent(myInfo.main_location.location_id, {
      onError: showError('본진으로 돌아가지 못했어요.'),
    });
  };

  // 편집 화면으로 가면 시트가 화면을 덮은 채 남으므로 먼저 닫는다.
  const openEditor = (mode: 'current' | 'main') => {
    handleClose();
    router.push({ pathname: '/profile/edit-region', params: { mode } });
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      <View className="flex flex-col gap-2xl">
        <Typography variant="h1" className="text-gray-700">
          내 동네
        </Typography>

        {isLoading ? (
          <View className="flex flex-col gap-md">
            <Skeleton className="h-[76px] w-full rounded-md" />
            <Skeleton className="h-[76px] w-full rounded-md" />
            <Skeleton className="h-[76px] w-full rounded-md" />
          </View>
        ) : isError || !myInfo ? (
          <ErrorRetry message="동네 정보를 불러오지 못했어요." onRetry={handleRetry} />
        ) : (
          <View className="flex flex-col gap-md">
            <StatusBanner atHome={myInfo.at_home} />

            <LocationCard
              label="본진"
              place={formatPlace(myInfo.main_location)}
              actionLabel="변경"
              onPress={() => openEditor('main')}
            >
              {myInfo.pending_location && (
                <View className="flex flex-row items-center justify-between gap-sm rounded-sm bg-gray-50 py-sm pl-md pr-xs">
                  <Typography variant="caption" className="flex-1 text-gray-600">
                    다음 라운드부터 {formatPlace(myInfo.pending_location)}
                  </Typography>
                  <Pressable
                    onPress={handleCancel}
                    disabled={isCancelling}
                    hitSlop={8}
                    className={`rounded-sm px-sm py-xs active:bg-gray-100 ${
                      isCancelling ? 'opacity-50' : ''
                    }`}
                  >
                    <Typography variant="caption" className="text-primary-600">
                      예약 취소
                    </Typography>
                  </Pressable>
                </View>
              )}
            </LocationCard>

            <LocationCard
              label="현재 지역"
              place={formatPlace(myInfo.current_location)}
              actionLabel="이동"
              onPress={() => openEditor('current')}
            />

            {errorMessage && (
              <Typography variant="caption" className="text-primary-600">
                {errorMessage}
              </Typography>
            )}
          </View>
        )}

        {myInfo && !myInfo.at_home && (
          <Button
            content={isReturning ? '돌아가는 중...' : '본진으로 돌아가기'}
            onclick={handleReturnHome}
            className={`w-full ${isReturning ? 'opacity-50' : ''}`}
          />
        )}
      </View>
    </BottomSheet>
  );
}
