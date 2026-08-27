import { getProviderAccessToken } from '@/api/social';
import KakaoIcon from '@/assets/icons/kakao.svg';
import LogoImage from '@/assets/icons/logo.webp';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useLogin } from '@/hooks/auth/useLogin';
import type { Provider } from '@/types/auth';
import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const { showToast } = useToast();
  const { mutate: login, isPending } = useLogin();

  // 카카오 로그인 창이 떠 있는 동안의 상태. isPending은 서버 요청 구간만 덮기 때문에,
  // 이게 없으면 카카오톡으로 넘어가는 찰나에 버튼을 또 눌러 로그인 창이 두 번 뜬다.
  const [isProviderPending, setIsProviderPending] = useState(false);
  const isBusy = isProviderPending || isPending;

  const handleSocialLogin = async (provider: Provider) => {
    if (isBusy) return;

    let providerAccessToken: string | null;
    setIsProviderPending(true);
    try {
      providerAccessToken = await getProviderAccessToken(provider);
    } catch (error) {
      console.error(`[auth] ${provider} 로그인 실패`, error);
      showToast('소셜 로그인에 실패했어요. 다시 시도해주세요');
      return;
    } finally {
      setIsProviderPending(false);
    }

    // 사용자가 로그인 창을 직접 닫은 경우(취소). 본인이 그만둔 것이므로 따로 알리지 않는다.
    if (!providerAccessToken) return;

    login(
      { provider, providerAccessToken },
      {
        // 로그인 실패(소셜 토큰 만료·서버 오류)는 화면 전환 없이 토스트로만 알린다.
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

        {/* 로그인 버튼: 화면 하단 고정 */}
        <Pressable
          onPress={() => handleSocialLogin('KAKAO')}
          disabled={isBusy}
          className="flex-row items-center mb-2xl justify-center gap-sm rounded-md bg-[#FEE500] py-md active:bg-[#EED500] disabled:opacity-50"
        >
          <KakaoIcon width={24} height={24} />
          <Typography variant="h3" className="text-gray-700">
            카카오로 계속하기
          </Typography>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
