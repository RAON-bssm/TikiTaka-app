import { getProviderAccessToken } from '@/api/social';
import KakaoIcon from '@/assets/icons/kakao.svg';
import LogoImage from '@/assets/icons/logo.webp';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useLogin } from '@/hooks/auth/useLogin';
import type { Provider } from '@/types/auth';
import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const { showToast } = useToast();
  const { mutate: login, isPending } = useLogin();

  const handleSocialLogin = async (provider: Provider) => {
    const providerAccessToken = await getProviderAccessToken(provider);

    // TODO(소셜 SDK 연동): SDK가 붙으면 이 분기를 통째로 지운다.
    // 지금은 토큰을 받을 수 없어 UI 확인용으로 회원가입 화면만 열어둔다.
    if (!providerAccessToken) {
      showToast('소셜 로그인은 준비 중이에요');
      router.push('/(auth)/signup');
      return;
    }

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
          disabled={isPending}
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
