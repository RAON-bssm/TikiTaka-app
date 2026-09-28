import { getApiErrorMessage } from '@/api/error';
import { formatLocationName } from '@/constants/location';
import { useCancelLocationChange } from '@/hooks/user/useLocationChange';
import { useMyInfo } from '@/hooks/user/useMyInfo';
import type { UserLocation } from '@/types/location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

export default function NeighborhoodSheet({ visible, onClose }: Props) {
  const router = useRouter();
  const { data: myInfo, isLoading, isError, refetch } = useMyInfo();
  const { mutate: cancelChange, isPending: isCancelling } = useCancelLocationChange();
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleClose = () => {
    setErrorMessage(undefined);
    onClose();
  };

  const handleRetry = () => {
    setErrorMessage(undefined);
    refetch();
  };

  const handleCancel = () => {
    if (isCancelling) return;
    setErrorMessage(undefined);
    // 이 시트는 RN Modal이고 ToastProvider는 그 아래 트리라 토스트가 가린다. 시트 안에 적는다.
    cancelChange(undefined, {
      onError: (error) => setErrorMessage(getApiErrorMessage(error, '예약을 취소하지 못했어요.')),
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
        <View className="flex flex-col gap-md">
          <Typography variant="h1" className="text-gray-700">
            내 동네 설정
          </Typography>
          <Typography variant="body2" className="text-gray-400">
            본진에 있을 때 올린 게시물만 동네 점수에 들어가요.
          </Typography>
        </View>

        {isLoading ? (
          <View className="flex flex-col gap-lg">
            <Skeleton className="h-6 w-40 rounded-sm" />
            <Skeleton className="h-6 w-40 rounded-sm" />
          </View>
        ) : isError || !myInfo ? (
          <ErrorRetry message="동네 정보를 불러오지 못했어요." onRetry={handleRetry} />
        ) : (
          <View className="flex flex-col gap-lg">
            <View className="flex flex-col gap-xs">
              <Typography variant="h4" className="text-gray-500">
                본진
              </Typography>
              <Typography variant="body2" className="text-gray-700">
                {formatPlace(myInfo.main_location)}
              </Typography>
              {myInfo.pending_location && (
                <View className="flex flex-row items-center gap-sm">
                  <Typography variant="caption" className="text-primary-600">
                    다음 라운드부터 {formatPlace(myInfo.pending_location)}
                  </Typography>
                  <Pressable onPress={handleCancel} disabled={isCancelling} hitSlop={8}>
                    <Typography
                      variant="caption"
                      className={`text-gray-400 underline ${isCancelling ? 'opacity-50' : ''}`}
                    >
                      예약 취소
                    </Typography>
                  </Pressable>
                </View>
              )}
            </View>

            <View className="flex flex-col gap-xs">
              <Typography variant="h4" className="text-gray-500">
                현재 지역
              </Typography>
              <Typography variant="body2" className="text-gray-700">
                {formatPlace(myInfo.current_location)}
              </Typography>
              {!myInfo.at_home && (
                <Typography variant="caption" className="text-gray-400">
                  본진이 아니라 동네 점수는 올라가지 않아요.
                </Typography>
              )}
            </View>

            {errorMessage && (
              <Typography variant="caption" className="text-primary-600">
                {errorMessage}
              </Typography>
            )}
          </View>
        )}

        <View className="flex flex-row gap-md w-full">
          <Button
            content="현재 지역 이동"
            variant="light"
            className="flex-1"
            onclick={() => openEditor('current')}
          />
          <Button content="본진 변경" className="flex-1" onclick={() => openEditor('main')} />
        </View>
      </View>
    </BottomSheet>
  );
}
