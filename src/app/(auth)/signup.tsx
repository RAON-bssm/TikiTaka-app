import { getSignupToken } from '@/api/token';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import RegionSelect from '@/components/ui/input/RegionSelect';
import TextInput from '@/components/ui/input/TextInput';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useSignup } from '@/hooks/auth/useSignup';
import { useLocations } from '@/hooks/location/useLocations';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** 서버 응답 상태코드를 사용자에게 보여줄 문구로 옮긴다. */
function getSignupErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : '가입에 실패했어요';
  }

  switch (error.response?.status) {
    case 409:
      return '이미 사용 중인 닉네임이에요';
    case 400:
      return '동네를 다시 선택해주세요';
    case 401:
      // signup token은 10분이면 만료된다. 이 경우 로그인부터 다시 해야 한다.
      return '가입 시간이 만료됐어요. 다시 로그인해주세요';
    default:
      return '가입에 실패했어요. 잠시 후 다시 시도해주세요';
  }
}

export default function SignUp() {
  const { showToast } = useToast();
  const { mutate: signup, isPending } = useSignup();

  const { data: locations, isLoading, isError, refetch } = useLocations();

  const [userName, setUserName] = useState('');
  const [mainLocationId, setMainLocationId] = useState<number>();

  const handleSignUp = () => {
    if (isPending) return;

    if (!userName.trim()) {
      showToast('닉네임을 입력해주세요');
      return;
    }
    if (!mainLocationId) {
      showToast('동네를 선택해주세요');
      return;
    }

    signup(
      { userName: userName.trim(), mainLocationId },
      {
        onError: (error) => {
          showToast(getSignupErrorMessage(error));
          // 401(만료)뿐 아니라 토큰이 아예 없는 경우도 로그인부터 다시 해야 한다.
          // signup token은 메모리에만 있어 앱을 재시작하면 사라지는데, 이때 useSignup은
          // Axios 에러가 아닌 일반 Error를 던진다. 이걸 걸러내지 않으면 안내 문구만 뜨고
          // 화면에 그대로 남아, 다시 눌러도 같은 에러만 반복되는 막다른 길이 된다.
          const isExpired = isAxiosError(error) && error.response?.status === 401;
          if (isExpired || !getSignupToken()) {
            router.replace('/(auth)/login');
          }
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex flex-1 flex-col items-start justify-between gap-4xl p-lg">
        <View className="flex flex-col items-start gap-3xl w-full">
          <BackButton title="정보등록" link={'/login'} />
          <Typography variant="display" className="text-gray-800">
            회원 정보 등록
          </Typography>
          <View className="flex flex-row gap-sm items-end w-full">
            <View className="flex-1">
              <TextInput
                label="닉네임"
                placeholder="닉네임을 입력해주세요"
                value={userName}
                onChangeText={setUserName}
              />
            </View>
            {/* TODO: 서버에 닉네임 중복확인 엔드포인트가 없다. 현재는 가입 시 409로만 알 수 있다. */}
            <Button content="중복확인" />
          </View>
          {isLoading ? (
            // 라벨 19 + gap-xs 4 + 선택칸 42(p-md 24 + text-sm 16 + border 2)
            <Skeleton className="h-[65px] w-full rounded-sm" />
          ) : isError ? (
            <ErrorRetry message="동네 목록을 불러오지 못했어요." onRetry={refetch} />
          ) : (
            <RegionSelect
              locations={locations ?? []}
              value={mainLocationId}
              onChange={setMainLocationId}
            />
          )}
        </View>
        <View className="w-full">
          <Button
            content={isPending ? '가입 중...' : '가입하기'}
            onclick={handleSignUp}
            className={isPending ? 'opacity-50' : ''}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
