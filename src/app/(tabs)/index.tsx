import FeedPreviewCard from '@/components/feed/FeedPreviewCard';
import Banner from '@/components/ui/banner/Banner';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const user = {
    name: '하린',
    profile: 'https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg',
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex-1 gap-2xl px-xl pt-lg">
        <Banner />
        <FeedPreviewCard
          imgUrl="https://i.pinimg.com/736x/f8/95/1a/f8951a0f7b8523223d87d0ab42498056.jpg"
          user={user}
          place="영도구"
        />
      </View>
    </SafeAreaView>
  );
}
