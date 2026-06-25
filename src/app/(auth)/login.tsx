import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Typography from '@/components/ui/Typography';

const GoogleIcon = ({ size = 23 }: { size?: number }) => (
  <Image
    source={require('@/assets/icons/google.svg')}
    className="object-contain"
    style={{ width: size, height: size }}
  />
);

const KakaoIcon = ({ size = 23 }: { size?: number }) => (
  <Image
    source={require('@/assets/icons/kakao.svg')}
    className="object-contain"
    style={{ width: size, height: size }}
  />
);

export default function Login() {
  const handleSocialLogin = () => {
    router.push('/(auth)/signup');
  };

  return (
    <SafeAreaView className="flex flex-col flex-1 bg-white">
      <View className="flex flex-col flex-1 p-lg">
        <View className="flex flex-col items-center w-full mt-[177.5px]">
          <Image
            source={require('@/assets/icons/logo.svg')}
            className="object-cover"
            style={{ width: 250, height: 59 }}
          />

          <Typography variant="h4" className="text-gray-500 mt-[14px]">
            여러분들의 동네리그에 참여해보세요!
          </Typography>
        </View>

        <View className="w-full gap-[12px] mt-[120px] flex-1 justify-end pb-lg">
          <Pressable
            onPress={handleSocialLogin}
            className="flex-row items-center justify-center gap-sm rounded-md border border-primary-400 bg-white py-md active:bg-gray-50"
          >
            <GoogleIcon />
            <Typography variant="h3" className="text-gray-600">
              구글로 계속하기
            </Typography>
          </Pressable>

          <Pressable
            onPress={handleSocialLogin}
            className="flex-row items-center justify-center gap-sm rounded-md bg-[#FEE500] py-md active:bg-[#EED500]"
          >
            <KakaoIcon />
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
