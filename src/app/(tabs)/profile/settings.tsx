import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import WithdrawDialog from '@/components/auth/WithdrawDialog';
import BackButton from '@/components/ui/BackButton';
import Header from '@/components/ui/Header';
import NavRow from '@/components/ui/NavRow';
import Typography from '@/components/ui/Typography';
import { useLogout } from '@/hooks/auth/useLogout';
import { useMyProfile } from '@/hooks/user/useMyProfile';

export default function SettingsScreen() {
  const logout = useLogout();
  const { data: profile } = useMyProfile();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex flex-1 flex-col gap-2xl px-xl pt-lg">
        <Header />
        <BackButton title="내 설정" />

        <View className="gap-md">
          <NavRow title="프로필 수정" onPress={() => router.push('/profile/edit')} />
          <NavRow title="로그아웃" onPress={() => logout.mutate()} />
        </View>

        {profile ? (
          <Pressable
            onPress={() => setIsWithdrawOpen(true)}
            hitSlop={8}
            className="mt-auto items-center py-2xl active:opacity-70"
          >
            <Typography variant="caption" className="text-gray-400 underline">
              회원 탈퇴
            </Typography>
          </Pressable>
        ) : null}
      </View>

      {profile ? (
        <WithdrawDialog
          visible={isWithdrawOpen}
          userName={profile.user_name}
          onClose={() => setIsWithdrawOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}
