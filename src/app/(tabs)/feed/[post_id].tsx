import Header from '@/components/ui/header';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostDetailScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2xl px-xl pt-lg"
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <View className="flex flex-col gap-md">{/**피드카드 컴포넌트 영역 */}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
