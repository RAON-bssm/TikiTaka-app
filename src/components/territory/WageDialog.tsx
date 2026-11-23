import { Modal, View } from 'react-native';

import ResultRow from '@/components/territory/ResultRow';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Typography from '@/components/ui/Typography';
import { useMyWages } from '@/hooks/territory/useMyWages';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// `paid_on`은 KST 날짜다. 사용자가 한국에 있다고 보고 기기 날짜와 비교한다.
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** 일급 알림을 눌러 들어왔을 때 띄운다. 알림에는 금액이 없어 내역의 최신 항목을 보여 준다. */
export default function WageDialog({ visible, onClose }: Props) {
  // 저장해 둔 캐시는 지급 전 값일 수 있다. 열 때마다 새로 받고, 받는 동안은 옛 금액 대신 스켈레톤을 보인다.
  const { data, isFetching, isError, refetch } = useMyWages(undefined, {
    enabled: visible,
    staleTime: 0,
  });
  const latest = data?.wages[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className="w-[300px] gap-2xl rounded-xl bg-white px-xl pb-xl pt-2xl">
          {isFetching ? (
            <Skeleton className="h-[160px] w-full rounded-md" />
          ) : isError ? (
            <ErrorRetry message="일급 내역을 불러오지 못했어요." onRetry={() => void refetch()} />
          ) : !latest ? (
            <Typography variant="h2" className="text-center text-gray-800">
              아직 받은 일급이 없어요
            </Typography>
          ) : (
            <>
              <View className="items-center gap-sm">
                <Typography variant="h2" className="text-center text-gray-800">
                  {latest.paid_on === getTodayString()
                    ? '오늘의 일급이 들어왔어요'
                    : '최근 받은 일급이에요'}
                </Typography>
                <Typography variant="h1" className="text-primary-600">
                  {`+${latest.amount.toLocaleString()} P`}
                </Typography>
              </View>
              <View className="gap-sm rounded-md bg-gray-50 p-lg">
                <ResultRow label="지급일" value={latest.paid_on} />
                <ResultRow label="가진 땅" value={`${latest.land_count.toLocaleString()}곳`} />
                <ResultRow
                  label="땅값 합계"
                  value={`${latest.total_land_price.toLocaleString()} P`}
                />
                <ResultRow label="지급 비율" value={`${Math.round(latest.rate * 100)}%`} />
              </View>
            </>
          )}
          <Button content="확인" onclick={onClose} />
        </View>
      </View>
    </Modal>
  );
}
