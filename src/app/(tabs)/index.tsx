import CurrentBattleCard from '@/components/feed/CurrentBattleCard';
import PostList from '@/components/feed/PostList';
import Banner from '@/components/ui/banner/Banner';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import Typography from '@/components/ui/Typography';
import { useCurrentBattle } from '@/hooks/match/useCurrentBattle';
import { useCurrentBoardPosts } from '@/hooks/post/useCurrentBoardPosts';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const PREVIEW_COUNT = 3;

export default function HomeScreen() {
  const router = useRouter();
  const battle = useCurrentBattle();
  const posts = useCurrentBoardPosts();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2xl px-xl pt-lg"
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <Banner />

        <View className="flex flex-col gap-sm">
          <CurrentBattleCard state={battle} />
          <Button content="바로 참여" />
        </View>

        <View className="flex flex-col gap-md">
          <View className="flex flex-row justify-between w-full items-center">
            <Typography variant="h3" className="text-gray-800">
              동네 훔쳐보기
            </Typography>
            <Pressable onPress={() => router.push('/feed')}>
              <Typography variant="body2" className="text-gray-500">
                더보기
              </Typography>
            </Pressable>
          </View>
          <PostList state={posts} limit={PREVIEW_COUNT} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
