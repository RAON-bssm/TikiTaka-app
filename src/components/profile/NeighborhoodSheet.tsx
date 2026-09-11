import RadioOnIcon from '@/assets/icons/radio-selected.svg';
import RadioOffIcon from '@/assets/icons/radio.svg';
import { getApiErrorMessage } from '@/api/error';
import { useCancelLocationSwap, useRequestLocationSwap } from '@/hooks/user/useLocationSwap';
import { useMyInfo } from '@/hooks/user/useMyInfo';
import type { Location } from '@/types/location';
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

/** `city_name`을 주지 않는 응답도 있을 수 있어 있을 때만 앞에 붙인다. */
function formatLocationName(location: Location): string {
  return location.city_name
    ? `${location.city_name} ${location.location_name}`
    : location.location_name;
}

/**
 * 라디오는 "지금 메인 동네"가 아니라 **다음 라운드에 대표할 동네**를 가리킨다.
 * 서브를 고르면 그 자리에서 교환되지 않고 스위칭이 예약되며, 예약 상태에서 메인을
 * 다시 고르면 취소된다.
 */
export default function NeighborhoodSheet({ visible, onClose }: Props) {
  const router = useRouter();
  const { data: myInfo, isLoading, isError, refetch } = useMyInfo();
  const { mutate: requestSwap, isPending: isRequesting } = useRequestLocationSwap();
  const { mutate: cancelSwap, isPending: isCancelling } = useCancelLocationSwap();
  const [errorMessage, setErrorMessage] = useState<string>();

  const isSwapping = isRequesting || isCancelling;
  const isSwapReserved = myInfo?.pending_location_swap ?? false;

  const neighborhoods = myInfo
    ? [myInfo.main_location, ...(myInfo.sub_location ? [myInfo.sub_location] : [])]
    : [];
  const selectedId = isSwapReserved
    ? myInfo?.sub_location?.location_id
    : myInfo?.main_location.location_id;

  const handleClose = () => {
    setErrorMessage(undefined);
    onClose();
  };

  const handleSelect = (locationId: number) => {
    // 항목이 둘뿐이라 "선택되지 않은 쪽을 누른다 = 예약을 뒤집는다"로 충분하다.
    if (isSwapping || locationId === selectedId) return;
    setErrorMessage(undefined);

    // 이 시트는 RN Modal이고 ToastProvider는 그 아래 트리라 토스트가 가린다. 시트 안에 적는다.
    const options = {
      onError: (error: unknown) =>
        setErrorMessage(getApiErrorMessage(error, '동네 변경 예약에 실패했어요.')),
    };

    if (isSwapReserved) {
      cancelSwap(undefined, options);
    } else {
      requestSwap(undefined, options);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      <View className="flex flex-col gap-2xl">
        <View className="flex flex-col gap-md">
          <Typography variant="h1" className="text-gray-700">
            내 동네 설정
          </Typography>
          <Typography variant="body2" className="text-gray-400">
            최대 2개의 동네를 선택할 수 있어요.
          </Typography>
        </View>

        {isLoading ? (
          <View className="flex flex-col gap-lg">
            <Skeleton className="h-6 w-40 rounded-sm" />
            <Skeleton className="h-6 w-40 rounded-sm" />
          </View>
        ) : isError || !myInfo ? (
          <ErrorRetry message="동네 정보를 불러오지 못했어요." onRetry={refetch} />
        ) : (
          <View className="flex flex-col gap-md">
            <View className="flex flex-col gap-lg">
              {neighborhoods.map((neighborhood) => {
                const selected = neighborhood.location_id === selectedId;
                return (
                  <Pressable
                    key={neighborhood.location_id}
                    onPress={() => handleSelect(neighborhood.location_id)}
                    className={`flex flex-row items-center gap-xs ${isSwapping ? 'opacity-50' : ''}`}
                  >
                    {selected ? (
                      <RadioOnIcon width={24} height={24} />
                    ) : (
                      <RadioOffIcon width={24} height={24} />
                    )}
                    <Typography
                      variant="body2"
                      className={selected ? 'text-primary-600' : 'text-gray-500'}
                    >
                      {formatLocationName(neighborhood)}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>

            {isSwapReserved && (
              <Typography variant="caption" className="text-gray-400">
                다음 라운드가 시작되면 대표 동네가 바뀌어요.
              </Typography>
            )}
            {errorMessage && (
              <Typography variant="caption" className="text-primary-600">
                {errorMessage}
              </Typography>
            )}
          </View>
        )}

        <Button
          content={myInfo?.sub_location ? '동네 변경' : '동네 추가'}
          onclick={() => router.push('/profile/edit-region')}
          className="w-full"
        />
      </View>
    </BottomSheet>
  );
}
