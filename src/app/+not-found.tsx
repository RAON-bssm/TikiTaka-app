import { router, usePathname } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Character from '@/components/character/Character';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { DEFAULT_CHARACTER_CONFIG } from '@/constants/character/assets';

export default function NotFoundScreen() {
  const pathname = usePathname();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-2xl">
        {/* 캐릭터가 404의 가운데 '0' 역할을 한다 */}
        <View className="flex-row items-center gap-lg">
          <Typography variant="display" className="font-title text-5xl text-primary-600">
            4
          </Typography>
          <View style={{ transform: [{ rotate: '-8deg' }] }}>
            <Character config={DEFAULT_CHARACTER_CONFIG} size={104} />
          </View>
          <Typography variant="display" className="font-title text-5xl text-primary-600">
            4
          </Typography>
        </View>

        <View className="mt-3xl items-center gap-md">
          <Typography variant="h1" className="text-gray-800">
            길을 잃어버렸어요!
          </Typography>
          <Typography variant="body2" className="text-center text-gray-500">
            찾으시는 페이지가 없어졌거나{'\n'}주소가 잘못 입력되었어요.
          </Typography>
        </View>

        <View className="mt-xl rounded-full bg-gray-100 px-lg py-xs">
          <Typography variant="caption" className="text-gray-500">
            {pathname}
          </Typography>
        </View>

        <View className="mt-4xl gap-md self-stretch">
          <Button content="홈으로 돌아가기" onclick={() => router.replace('/')} />
          {router.canGoBack() && (
            <Button content="이전 화면으로" variant="light" onclick={() => router.back()} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
