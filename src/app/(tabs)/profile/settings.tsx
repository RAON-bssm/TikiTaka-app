import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { DevSettings, Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resetPermissionNotice } from '@/api/permissionNotice';
import { startTutorialForNewUser } from '@/api/tutorial';
import LogoutDialog from '@/components/auth/LogoutDialog';
import WithdrawDialog from '@/components/auth/WithdrawDialog';
import BackButton from '@/components/ui/BackButton';
import Header from '@/components/ui/Header';
import NavRow from '@/components/ui/NavRow';
import Typography from '@/components/ui/Typography';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/constants/legal';
import { useTutorial } from '@/hooks/tutorial/useTutorial';
import { useMyProfile } from '@/hooks/user/useMyProfile';

export default function SettingsScreen() {
  const { data: profile } = useMyProfile();
  const { start: startTutorial } = useTutorial();

  // 신규 가입 직후와 같은 상태(권한 안내 미확인 + 튜토리얼 대기)로 만든 뒤 JS를 다시 띄운다.
  const handleDevFirstLaunch = async () => {
    await Promise.all([resetPermissionNotice(), startTutorialForNewUser()]).catch(() => {});
    DevSettings.reload();
  };
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
          <NavRow title="차단 목록" onPress={() => router.push('/profile/blocked-users')} />
          <NavRow
            title="튜토리얼 다시 보기"
            onPress={() => {
              router.navigate('/');
              startTutorial();
            }}
          />
          <NavRow
            title="개인정보처리방침"
            onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
          />
          <NavRow
            title="이용약관"
            onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL)}
          />
          <NavRow title="로그아웃" onPress={() => setIsLogoutOpen(true)} />
          {__DEV__ && (
            <>
              <NavRow
                title="땅따먹기 미리보기 (개발용)"
                description="목 데이터로 새 땅따먹기 화면을 직접 조작해요"
                onPress={() => router.push('/profile/dev-territory')}
              />
              <NavRow
                title="첫 실행부터 보기 (개발용)"
                description="권한 안내·튜토리얼 기록을 지우고 앱을 다시 불러와요"
                onPress={handleDevFirstLaunch}
              />
              <NavRow
                title="온보딩부터 보기 (개발용)"
                description="온보딩 화면을 거쳐 튜토리얼을 시작해요"
                onPress={() => router.push('/(auth)/onboarding')}
              />
            </>
          )}
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
