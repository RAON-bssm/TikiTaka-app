import { getApiErrorMessage } from '@/api/error';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Header from '@/components/ui/Header';
import TextInput from '@/components/ui/input/TextInput';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useMyProfile } from '@/hooks/user/useMyProfile';
import { useUpdateProfile } from '@/hooks/user/useUpdateProfile';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfile() {
  const { showToast } = useToast();
  const { data: profile, isLoading, isError, refetch } = useMyProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  // null은 "아직 손대지 않음"을 뜻해 서버 닉네임을 그대로 보여주고, 한 번 고치면 그 값이 이긴다.
  // 빈 문자열은 null이 아니므로, 입력을 다 지워도 서버 값으로 되돌아가지 않는다.
  const [editedName, setEditedName] = useState<string | null>(null);
  const userName = editedName ?? profile?.user_name ?? '';

  const handleSubmit = () => {
    if (isPending) return;

    const nextName = userName.trim();
    if (!nextName) {
      showToast('닉네임을 입력해주세요');
      return;
    }
    // 부분 수정이라 같은 값을 보내도 통과하지만, 굳이 요청을 낼 이유가 없다.
    if (nextName === profile?.user_name) {
      showToast('닉네임이 이전과 같아요');
      return;
    }

    updateProfile(
      { user_name: nextName },
      {
        onSuccess: () => {
          showToast('닉네임을 변경했어요');
          router.back();
        },
        // 닉네임 중복(409) 등 거절 사유는 서버가 message로 내려주므로 그걸 우선 보여준다.
        onError: (error) => showToast(getApiErrorMessage(error, '닉네임 변경에 실패했어요')),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex flex-1 flex-col items-start justify-between gap-4xl p-lg">
        <View className="flex flex-col items-center gap-2xl w-full">
          <Header />
          <View className="flex flex-col items-start gap-3xl w-full">
            <BackButton title="프로필 수정" />
            <Typography variant="display" className="text-gray-600">
              프로필 정보 입력
            </Typography>
            {isLoading ? (
              <Skeleton className="h-[65px] w-full rounded-sm" />
            ) : isError || !profile ? (
              <ErrorRetry message="프로필을 불러오지 못했어요." onRetry={refetch} />
            ) : (
              <View className="flex flex-row items-end gap-sm w-full">
                <View className="flex-1">
                  <TextInput
                    label="닉네임"
                    placeholder="닉네임을 입력해주세요"
                    value={userName}
                    onChangeText={setEditedName}
                  />
                </View>
                {/* TODO: 서버에 닉네임 중복확인 엔드포인트가 없다. 현재는 수정 시 409로만 알 수 있다. */}
                <Button content="중복확인" />
              </View>
            )}
          </View>
        </View>
        <View className="w-full">
          {/* 현재 닉네임을 모르는 상태로 보내면 "이전과 같음"을 가려낼 수 없어, 불러오기 전에는 숨긴다. */}
          {profile && (
            <Button
              content={isPending ? '수정 중...' : '수정하기'}
              onclick={handleSubmit}
              className={isPending ? 'opacity-50' : ''}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
