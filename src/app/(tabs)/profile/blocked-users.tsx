import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Header from '@/components/ui/Header';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { getApiErrorMessage } from '@/api/error';
import { useBlockedUsers } from '@/hooks/block/useBlockedUsers';
import { useUnblockUser } from '@/hooks/block/useUnblockUser';

export default function BlockedUsersScreen() {
  const { showToast } = useToast();
  const { data: blockedUsers, isLoading, isError, refetch } = useBlockedUsers();
  const { mutate: unblockUser, isPending } = useUnblockUser();

  const handleUnblock = (userId: string, userName: string) => {
    if (isPending) return;
    unblockUser(userId, {
      onSuccess: () => showToast(`${userName}님을 차단 해제했어요`),
      onError: (error) => showToast(getApiErrorMessage(error, '차단 해제하지 못했어요')),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow flex-col gap-2xl px-xl pt-lg"
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <BackButton title="차단 목록" />

        {isLoading ? (
          <View className="gap-sm">
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </View>
        ) : isError ? (
          <ErrorRetry message="차단 목록을 불러오지 못했어요." onRetry={refetch} />
        ) : !blockedUsers?.length ? (
          <Typography variant="body2" className="py-3xl text-center text-gray-400">
            차단한 사용자가 없어요.
          </Typography>
        ) : (
          <View className="gap-sm">
            {blockedUsers.map((user) => (
              <View
                key={user.user_id}
                className="flex-row items-center justify-between rounded-md bg-gray-100 p-lg"
              >
                <Typography variant="h3" className="text-gray-700">
                  {user.user_name}
                </Typography>
                <Button
                  content="차단 해제"
                  variant="light"
                  size="sm"
                  onclick={() => handleUnblock(user.user_id, user.user_name)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
