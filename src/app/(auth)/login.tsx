import GoogleIcon from '@/assets/icons/google.svg';
import KakaoIcon from '@/assets/icons/kakao.svg';
import LogoIcon from '@/assets/icons/logo.svg';
import Typography from '@/components/ui/Typography';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const handleSocialLogin = () => {
    router.push('/(auth)/signup');
  };

  return (
    <SafeAreaView className="flex flex-col flex-1 bg-white">
      <View className="flex flex-col flex-1 p-lg">
        <View className="flex flex-col items-center w-full mt-[177.5px]">
          <LogoIcon width={250} height={59} />

          <Typography variant="h4" className="text-gray-500 mt-[14px]">
            여러분들의 동네리그에 참여해보세요!
          </Typography>
        </View>

        <View className="w-full gap-[12px] mt-[120px] flex-1 justify-end pb-lg">
          <Pressable
            onPress={handleSocialLogin}
            className="flex-row items-center justify-center gap-sm rounded-md border border-primary-400 bg-white py-md active:bg-gray-50"
          >
            <GoogleIcon width={23} height={23} />
            <Typography variant="h3" className="text-gray-600">
              구글로 계속하기
            </Typography>
          </Pressable>

          <Pressable
            onPress={handleSocialLogin}
            className="flex-row items-center justify-center gap-sm rounded-md bg-[#FEE500] py-md active:bg-[#EED500]"
          >
            <KakaoIcon width={23} height={23} />
            <Typography variant="h3" className="text-gray-600">
              카카오로 계속하기
            </Typography>
          </Pressable>

          <Pressable className="items-center py-sm mt-[17px] mb-[174px]">
            <Typography variant="h4" className="text-gray-500">
              게스트로 시작하기
            </Typography>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
