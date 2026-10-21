import { getProviderAccessToken } from '@/api/social';
import AppleIcon from '@/assets/icons/apple.svg';
import KakaoIcon from '@/assets/icons/kakao.svg';
import LogoImage from '@/assets/icons/logo.webp';
import EulaConsent from '@/components/auth/EulaConsent';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useEulaConsent } from '@/hooks/auth/useEulaConsent';
import { useLogin } from '@/hooks/auth/useLogin';
import type { Provider } from '@/types/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const { showToast } = useToast();
  const { mutate: login, isPending } = useLogin();
  const { hasAgreed, markAgreed } = useEulaConsent();

  // 소셜 로그인 창이 떠 있는 동안의 상태. isPending은 서버 요청 구간만 덮기 때문에,
  // 이게 없으면 카카오톡으로 넘어가는 찰나에 버튼을 또 눌러 로그인 창이 두 번 뜬다.
  const [isProviderPending, setIsProviderPending] = useState(false);
  const isBusy = isProviderPending || isPending;

  // Apple 로그인은 iOS 전용이라 Android에서는 버튼을 숨긴다(platform.md 예외).
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  useEffect(() => {
    AppleAuthentication.isAvailableAsync()
      .then(setIsAppleAvailable)
      .catch(() => setIsAppleAvailable(false));
  }, []);

  const handleSocialLogin = async (provider: Provider) => {
    if (isBusy || !hasAgreed) return;

    let providerAccessToken: string | null;
    setIsProviderPending(true);
    try {
      providerAccessToken = await getProviderAccessToken(provider);
    } catch {
      showToast('소셜 로그인에 실패했어요. 다시 시도해주세요');
      return;
    } finally {
      setIsProviderPending(false);
    }

    // 사용자가 직접 취소한 경우라 따로 알리지 않는다.
    if (!providerAccessToken) return;

    login(
      { provider, providerAccessToken },
      {
        onError: () => showToast('로그인에 실패했어요. 다시 시도해주세요'),
      },
    );
  };

  return (
    <SafeAreaView className="flex flex-col flex-1 bg-white">
      <View className="flex flex-col flex-1 px-lg pb-3xl">
        <View style={{ flex: 1 }} />

        <View className="flex flex-col items-center gap-md">
          <Image source={LogoImage} style={{ width: 250, height: 64 }} resizeMode="contain" />

          <Typography variant="body2" className="text-gray-500">
            여러분들의 동네리그에 참여해보세요!
          </Typography>
        </View>

        <View style={{ flex: 3 }} />

        <View className="flex flex-col gap-lg mb-2xl">
          <EulaConsent checked={hasAgreed} onToggle={() => !hasAgreed && markAgreed()} />

          <View className="flex flex-col gap-sm">
            <Pressable
              onPress={() => handleSocialLogin('KAKAO')}
              disabled={isBusy || !hasAgreed}
              className="flex-row items-center justify-center gap-sm rounded-md bg-kakao py-md active:bg-kakao-pressed disabled:opacity-50"
            >
              <KakaoIcon width={24} height={24} />
              <Typography variant="h3" className="text-gray-700">
                카카오로 계속하기
              </Typography>
            </Pressable>

            {isAppleAvailable && (
              <Pressable
                onPress={() => handleSocialLogin('APPLE')}
                disabled={isBusy || !hasAgreed}
                className="flex-row items-center justify-center gap-sm rounded-md bg-apple py-md active:bg-apple-pressed disabled:opacity-50"
              >
                <AppleIcon width={24} height={24} />
                <Typography variant="h3" className="text-white">
                  Apple로 계속하기
                </Typography>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
