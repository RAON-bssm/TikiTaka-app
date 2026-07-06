import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ShopTabs from '@/components/market/ShopTabs';
import Header from '@/components/ui/header';
import PointBadge from '@/components/ui/PointBadge';
import { USER_POINT } from '@/constants/market';

export default function GachaScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex flex-1 flex-col gap-2xl px-lg pt-lg">
        <Header />

        <View className="w-full flex-row items-center justify-between">
          <ShopTabs />
          <PointBadge point={USER_POINT} />
        </View>
      </View>
    </SafeAreaView>
  );
}
