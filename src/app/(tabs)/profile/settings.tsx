import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import LogoutDialog from '@/components/auth/LogoutDialog';
import WithdrawDialog from '@/components/auth/WithdrawDialog';
import BackButton from '@/components/ui/BackButton';
import Header from '@/components/ui/Header';
import NavRow from '@/components/ui/NavRow';
import Typography from '@/components/ui/Typography';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/constants/legal';
import { useMyProfile } from '@/hooks/user/useMyProfile';

export default function SettingsScreen() {
  const { data: profile } = useMyProfile();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow flex-col gap-2xl px-xl pt-lg"
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <BackButton title="내 설정" />

        <View className="gap-md">
          <NavRow title="프로필 수정" onPress={() => router.push('/profile/edit')} />
          <NavRow
            title="개인정보처리방침"
            onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
          />
          <NavRow
            title="이용약관"
            onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL)}
          />
          <NavRow title="로그아웃" onPress={() => setIsLogoutOpen(true)} />
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
      </ScrollView>

      <LogoutDialog visible={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />

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
