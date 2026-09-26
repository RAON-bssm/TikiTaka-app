import { getSignupToken } from '@/api/token';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import RegionSelect from '@/components/ui/input/RegionSelect';
import TextInput from '@/components/ui/input/TextInput';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { getApiErrorMessage } from '@/api/error';
import { useCheckUserName } from '@/hooks/auth/useCheckUserName';
import { useSignup } from '@/hooks/auth/useSignup';
import { useLocations } from '@/hooks/location/useLocations';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  // 확인 후 닉네임을 고치면 결과가 무효가 되도록, 어떤 닉네임에 대한 결과인지 함께 둔다.
  const [nameCheck, setNameCheck] = useState<{ name: string; available: boolean }>();
  const { mutate: checkName, isPending: isChecking } = useCheckUserName();

  const trimmedName = userName.trim();
  const currentCheck = nameCheck?.name === trimmedName ? nameCheck : undefined;

  const handleCheckName = () => {
    if (isChecking) return;
    if (!trimmedName) {
      showToast('닉네임을 입력해주세요');
      return;
    }

    checkName(trimmedName, {
      onSuccess: (available) => setNameCheck({ name: trimmedName, available }),
      onError: (error) => showToast(getApiErrorMessage(error, '중복확인에 실패했어요')),
    });
  };

  const handleSignUp = () => {
    if (isPending) return;

    if (!trimmedName) {
      showToast('닉네임을 입력해주세요');
      return;
    }
    if (!currentCheck) {
      showToast('닉네임 중복확인을 해주세요');
      return;
    }
    if (!currentCheck.available) {
      showToast('이미 사용 중인 닉네임이에요');
      return;
    }
    if (!mainLocationId) {
      showToast('동네를 선택해주세요');
      return;
    }

    signup(
      { userName: trimmedName, mainLocationId },
      {
        onError: (error) => {
          showToast(getSignupErrorMessage(error));
          // signup token은 메모리에만 있어 앱을 재시작하면 사라진다. 이때 useSignup은 Axios
          // 에러가 아닌 일반 Error를 던져, 걸러내지 않으면 같은 에러만 반복되는 막다른 길이 된다.
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
          <View className="flex flex-col gap-xs w-full">
            <View className="flex flex-row gap-sm items-end w-full">
              <View className="flex-1">
                <TextInput
                  label="닉네임"
                  placeholder="닉네임을 입력해주세요"
                  value={userName}
                  onChangeText={setUserName}
                />
              </View>
              <Button
                content="중복확인"
                onclick={handleCheckName}
                className={isChecking ? 'opacity-50' : ''}
              />
            </View>
            {currentCheck ? (
              <Typography
                variant="caption"
                className={currentCheck.available ? 'text-secondary-500' : 'text-primary-600'}
              >
                {currentCheck.available
                  ? '사용 가능한 닉네임이에요'
                  : '이미 사용 중인 닉네임이에요'}
              </Typography>
            ) : null}
          </View>
          {isLoading ? (
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
